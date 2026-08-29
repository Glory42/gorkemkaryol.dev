import { workersRuntime, type CachePort } from "@/server/runtime";

// Read-through cache over a CachePort — defaults to the Workers `caches` global,
// tests pass an in-memory Map.
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
  cache: CachePort = workersRuntime().cache,
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== undefined) return hit;

  const result = await fn();
  await cache.set(key, result, ttlSeconds);
  return result;
}
