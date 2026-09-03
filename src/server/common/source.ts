import type { RuntimeEnv } from "@/lib/env";
import { withCache } from "@/server/common/cache";
import {
  graphqlRequest,
  type GraphqlRequestOptions,
} from "@/server/common/graphql";
import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/common/http";
import { workersRuntime, type RuntimePort } from "@/server/common/runtime";

// An upstream source: given the env bindings and the ambient request context,
// reach one external thing and return a render-ready result.
export interface SourceCtx {
  runtime: RuntimePort;
  /** The incoming request. Only request-shaped sources (edge) read it. */
  request: Request | null;
}

export type Source<T> = (
  env: RuntimeEnv,
  ctx: SourceCtx,
) => ServiceResult<T> | Promise<ServiceResult<T>>;

// Build a ctx for direct calls and tests; defaults to the real Workers runtime.
export function sourceCtx(overrides: Partial<SourceCtx> = {}): SourceCtx {
  return {
    runtime: overrides.runtime ?? workersRuntime(),
    request: overrides.request ?? null,
  };
}

// --- Upstream client ---
// One client per upstream: `get` / `gql` own transport, caching, base URL and
// the GraphQL envelope. Cache keys derive from `scope` + request shape, and a
// failed result is never written to the cache.

export interface SourceClientOptions {
  /** Absolute base URL. `get(path)` appends `path`; `gql()` posts here. */
  base: string;
  /** GraphQL endpoint for `gql()`, when it differs from `base`. */
  graphqlUrl?: string;
  /** Namespaces every cache key for this client, e.g. `github:${username}`. */
  scope: string;
  /** Default cache lifetime in seconds. A per-call `ttl` overrides it. */
  defaultTtl: number;
  timeoutMs?: number;
  retries?: number;
  /** Sent on every request from this client. */
  headers?: Record<string, string>;
  /** When present and not ok, every call short-circuits to this failure with
   *  no network hit. Use it for env / precondition checks. */
  guard?: ServiceResult<unknown>;
  runtime?: RuntimePort;
}

export interface GetOptions {
  ttl?: number;
  timeoutMs?: number;
  /** Cache discriminant override — set it when `path` carries volatile or
   *  secret query params that must not shape the key. */
  cacheDiscriminant?: string;
}

export interface GqlOptions {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  ttl?: number;
  timeoutMs?: number;
  label?: string;
  /** Cache discriminant override — set it when `variables` carry volatile
   *  values (timestamps) that must not bust the cache every call. */
  cacheDiscriminant?: string;
  onMeta?: GraphqlRequestOptions["onMeta"];
}

export interface SourceClient {
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

const isOk = (result: ServiceResult<unknown>): boolean => result.ok;

export function createSourceClient(
  options: SourceClientOptions,
): SourceClient {
  const runtime = options.runtime ?? workersRuntime();
  const timeoutMs = options.timeoutMs ?? 12_000;
  const retries = options.retries ?? 1;
  const graphqlUrl = options.graphqlUrl ?? options.base;

  function keyFor(kind: string, discriminant: string): string {
    return `upstream:${hashKey(`${options.scope}\n${kind}\n${discriminant}`)}`;
  }

  async function get<T>(
    path: string,
    opts: GetOptions = {},
  ): Promise<ServiceResult<T>> {
    if (options.guard && !options.guard.ok) return fail(options.guard.error);

    return withCache(
      keyFor("get", opts.cacheDiscriminant ?? path),
      opts.ttl ?? options.defaultTtl,
      async (): Promise<ServiceResult<T>> => {
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
      isOk,
    );
  }

  async function gql<T>(
    query: string,
    opts: GqlOptions = {},
  ): Promise<ServiceResult<T>> {
    if (options.guard && !options.guard.ok) return fail(options.guard.error);

    const discriminant =
      opts.cacheDiscriminant ??
      `${query}\n${JSON.stringify(opts.variables ?? {})}`;

    return withCache(
      keyFor("gql", discriminant),
      opts.ttl ?? options.defaultTtl,
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
      isOk,
    );
  }

  return { get, gql };
}
