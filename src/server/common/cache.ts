import { workersRuntime, type CachePort } from "@/server/common/runtime";

// Read-through cache; `cacheWhen` keeps results such as transient failures out.
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
  cache: CachePort = workersRuntime().cache,
  cacheWhen: (result: T) => boolean = () => true,
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== undefined) return hit;

  const result = await fn();
  if (cacheWhen(result)) await cache.set(key, result, ttlSeconds);
  return result;
}

interface StaleEntry<T> {
  value: T;
  storedAt: number;
}

// Cache entries can outlive a format change, so a miss-shaped value is treated
// as no value instead of rendering `undefined`.
function isStaleEntry<T>(hit: unknown): hit is StaleEntry<T> {
  return (
    typeof hit === "object" &&
    hit !== null &&
    "value" in hit &&
    typeof (hit as StaleEntry<T>).storedAt === "number"
  );
}

export interface StaleCacheValue<T> {
  value: T;
  /** True when the value is a fallback or older than the fresh window. */
  stale: boolean;
  /** False when nothing was stored and `value` is the caller's fallback. */
  cached: boolean;
}

export interface StaleCacheOptions {
  key: string;
  /** How long a value is considered fresh. Older values are still served. */
  ttlSeconds: number;
  cache?: CachePort;
  now?: () => number;
}

export interface RevalidateOptions<T> extends StaleCacheOptions {
  fn: () => Promise<T>;
  /** Keeps failures (or empty results) from replacing a good snapshot. */
  cacheWhen?: (result: T) => boolean;
}

// Keep stale values well past their fresh window, so a cold upstream can still
// fall back to the last good snapshot instead of blocking first paint.
const STALE_TTL_SECONDS = 60 * 60 * 24 * 7;

// One refresh per key per isolate, so concurrent requests don't stampede upstream.
const inFlight = new Map<string, Promise<unknown>>();

// Read the last good value without touching the network. The caller renders it
// immediately, then asks for a revalidation when `stale` is true.
export async function readStaleCache<T>(
  options: StaleCacheOptions & { fallback: T },
): Promise<StaleCacheValue<T>> {
  const cache = options.cache ?? workersRuntime().cache;
  const now = options.now ?? Date.now;
  const hit = await cache.get<StaleEntry<T>>(options.key);

  if (!isStaleEntry<T>(hit)) {
    return { value: options.fallback, stale: true, cached: false };
  }

  return {
    value: hit.value,
    stale: now() - hit.storedAt >= options.ttlSeconds * 1000,
    cached: true,
  };
}

// Refresh a stale value and store it. Returns the cached value when it is still
// fresh, so a late revalidation request is a no-op.
export async function revalidateStaleCache<T>(
  options: RevalidateOptions<T>,
): Promise<T> {
  const cache = options.cache ?? workersRuntime().cache;
  const now = options.now ?? Date.now;
  const hit = await cache.get<StaleEntry<T>>(options.key);

  if (isStaleEntry<T>(hit) && now() - hit.storedAt < options.ttlSeconds * 1000) {
    return hit.value;
  }

  const running = inFlight.get(options.key);
  if (running) return (await running) as T;

  const refresh = (async () => {
    const result = await options.fn();
    if (options.cacheWhen?.(result) ?? true) {
      await cache.set(
        options.key,
        { value: result, storedAt: now() } satisfies StaleEntry<T>,
        STALE_TTL_SECONDS,
      );
    }
    return result;
  })();

  inFlight.set(options.key, refresh);
  try {
    return await refresh;
  } finally {
    inFlight.delete(options.key);
  }
}
