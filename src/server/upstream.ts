import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/http";
import { graphqlRequest, type GraphqlRequestOptions } from "@/server/graphql";
import { withCache } from "@/server/cache";
import { workersRuntime, type RuntimePort } from "@/server/runtime";

/**
 * One interface for talking to an upstream. Each `get` / `gql` call owns what
 * every hand-written intake function used to re-derive: transport (retry +
 * timeout), read-through caching with a **derived** key, the base URL, and — via
 * `gql` — the GraphQL envelope. Exported intake functions shrink to typed
 * mappings over this.
 *
 * The cache key is built from the client's `cacheScope` plus the request shape
 * (path, or query + variables). Two call sites can no longer disagree on a
 * hand-typed key string — the collision class is gone by construction.
 */

export interface UpstreamClientOptions {
  /** Absolute base URL. `get(path)` appends `path`; `gql()` posts here. */
  base: string;
  /** GraphQL endpoint for `gql()`, when it differs from `base`. */
  graphqlUrl?: string;
  /** Default cache lifetime in seconds. A per-call `ttl` overrides it. */
  defaultTtl: number;
  timeoutMs?: number;
  retries?: number;
  /** Sent on every request from this client. */
  headers?: Record<string, string>;
  /**
   * Namespaces this client's cache keys. Defaults to `base`; set it when the
   * base alone doesn't distinguish two clients (e.g. per-account REST paths).
   */
  cacheScope?: string;
  /**
   * When present and not ok, every call short-circuits to this failure without
   * touching the network. Use it for env / precondition checks.
   */
  guard?: ServiceResult<unknown>;
  runtime?: RuntimePort;
}

export interface GetOptions {
  ttl?: number;
  timeoutMs?: number;
  /** Overrides the derived cache discriminant. */
  cacheKey?: string;
}

export interface GqlOptions {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  ttl?: number;
  timeoutMs?: number;
  label?: string;
  /** Overrides the derived cache discriminant — use when `variables` carry
   *  volatile values (timestamps) that must not bust the cache every call. */
  cacheKey?: string;
  onMeta?: GraphqlRequestOptions["onMeta"];
}

export interface UpstreamClient {
  get<T>(path: string, options?: GetOptions): Promise<ServiceResult<T>>;
  gql<T>(query: string, options?: GqlOptions): Promise<ServiceResult<T>>;
}

/** FNV-1a — small, stable, good enough to namespace cache keys. */
function hashKey(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function createUpstreamClient(
  options: UpstreamClientOptions,
): UpstreamClient {
  const runtime = options.runtime ?? workersRuntime();
  const timeoutMs = options.timeoutMs ?? 12_000;
  const retries = options.retries ?? 1;
  const graphqlUrl = options.graphqlUrl ?? options.base;
  const scope = options.cacheScope ?? options.base;

  function keyFor(kind: string, discriminant: string): string {
    return `upstream:${hashKey(`${scope}\n${kind}\n${discriminant}`)}`;
  }

  async function get<T>(
    path: string,
    opts: GetOptions = {},
  ): Promise<ServiceResult<T>> {
    if (options.guard && !options.guard.ok) return fail(options.guard.error);

    const ttl = opts.ttl ?? options.defaultTtl;
    const key = keyFor("get", opts.cacheKey ?? path);

    return withCache(
      key,
      ttl,
      async () => {
        const res = await requestJsonWithRetry<unknown>({
          url: `${options.base}${path}`,
          method: "GET",
          headers: options.headers,
          timeoutMs: opts.timeoutMs ?? timeoutMs,
          retries,
          http: runtime.http,
        });
        if (!res.ok) return res;
        return ok(res.data.data as T);
      },
      runtime.cache,
    );
  }

  async function gql<T>(
    query: string,
    opts: GqlOptions = {},
  ): Promise<ServiceResult<T>> {
    if (options.guard && !options.guard.ok) return fail(options.guard.error);

    const ttl = opts.ttl ?? options.defaultTtl;
    const discriminant =
      opts.cacheKey ?? `${query}\n${JSON.stringify(opts.variables ?? {})}`;

    return withCache(
      keyFor("gql", discriminant),
      ttl,
      () =>
        graphqlRequest<T>({
          url: graphqlUrl,
          query,
          variables: opts.variables,
          headers: { ...options.headers, ...opts.headers },
          timeoutMs: opts.timeoutMs ?? timeoutMs,
          retries,
          label: opts.label,
          http: runtime.http,
          onMeta: opts.onMeta,
        }),
      runtime.cache,
    );
  }

  return { get, gql };
}
