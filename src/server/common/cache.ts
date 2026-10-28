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
