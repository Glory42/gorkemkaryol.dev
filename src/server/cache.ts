import { workersRuntime, type CachePort } from "@/server/runtime";

/**
 * Read-through cache. The storage lives behind a {@link CachePort} so tests can
 * pass an in-memory `Map` instead of the Workers `caches` global; production
 * calls fall through to {@link workersRuntime}.
 */
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
