import { workersRuntime, type CachePort } from "@/server/common/runtime";

// Read-through cache over a CachePort — defaults to the Workers `caches` global,
// tests pass an in-memory Map. `cacheWhen` gates the write so a caller can keep
// a transient failure out of the cache (default: store every result).
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
