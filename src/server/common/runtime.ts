// The seam under `fetch` and `caches`. Prod passes `workersRuntime` (real
// globals); tests pass `createInMemoryRuntime` (a Map + canned responses).

export interface HttpPort {
  fetch(url: string, init?: RequestInit): Promise<Response>;
}

export interface CachePort {
  /** Resolves to the stored value, or `undefined` on miss / expiry. */
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

export interface RuntimePort {
  http: HttpPort;
  cache: CachePort;
}

// --- Production adapter: the Cloudflare Workers globals ---

const CACHE_ORIGIN = "https://portfolio-cache.internal";

function workersCache(): CachePort {
  return {
    async get<T>(key: string): Promise<T | undefined> {
      if (typeof caches === "undefined") return undefined;
      const store = await caches.open("default");
      const hit = await store.match(cacheRequest(key));
      if (!hit) return undefined;
      return (await hit.json()) as T;
    },
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
      if (typeof caches === "undefined") return;
      const store = await caches.open("default");
      await store.put(
        cacheRequest(key),
        new Response(JSON.stringify(value), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${ttlSeconds}`,
          },
        }),
      );
    },
  };
}

function cacheRequest(key: string): Request {
  return new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`);
}

let cachedWorkersRuntime: RuntimePort | null = null;

export function workersRuntime(): RuntimePort {
  if (!cachedWorkersRuntime) {
    cachedWorkersRuntime = {
      http: { fetch: (url, init) => fetch(url, init) },
      cache: workersCache(),
    };
  }
  return cachedWorkersRuntime;
}

// --- Test adapter: in-memory ---

export interface CannedResponse {
  /** Substring match against the request URL. */
  url: string;
  status?: number;
  /** Serialised as the response body. A string is sent verbatim. */
  body: unknown;
  headers?: Record<string, string>;
}

export interface InMemoryRuntimeOptions {
  responses?: CannedResponse[];
  /** Records every URL the code under test fetched, in order. */
  calls?: string[];
  now?: () => number;
}

export function createInMemoryRuntime(
  options: InMemoryRuntimeOptions = {},
): RuntimePort {
  const responses = options.responses ?? [];
  const calls = options.calls ?? [];
  const now = options.now ?? (() => Date.now());
  const store = new Map<string, { value: unknown; expiresAt: number }>();

  return {
    http: {
      async fetch(url: string): Promise<Response> {
        calls.push(url);
        // Most specific (longest) matching pattern wins, so a loose pattern
        // can't shadow a precise one regardless of declaration order.
        const match = responses
          .filter((r) => url.includes(r.url))
          .sort((a, b) => b.url.length - a.url.length)[0];
        if (!match) {
          return new Response(`no canned response for ${url}`, { status: 599 });
        }
        const body =
          typeof match.body === "string"
            ? match.body
            : JSON.stringify(match.body);
        return new Response(body, {
          status: match.status ?? 200,
          headers: {
            "Content-Type": "application/json",
            ...(match.headers ?? {}),
          },
        });
      },
    },
    cache: {
      async get<T>(key: string): Promise<T | undefined> {
        const entry = store.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt <= now()) {
          store.delete(key);
          return undefined;
        }
        return entry.value as T;
      },
      async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        store.set(key, { value, expiresAt: now() + ttlSeconds * 1000 });
      },
    },
  };
}
