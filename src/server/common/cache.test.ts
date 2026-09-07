import { describe, expect, it, vi } from "vitest";
import { withCache } from "@/server/common/cache";
import type { CachePort } from "@/server/common/runtime";

function spyCache(): CachePort & {
  sets: Array<{ key: string; value: unknown; ttl: number }>;
} {
  const store = new Map<string, unknown>();
  const sets: Array<{ key: string; value: unknown; ttl: number }> = [];
  return {
    sets,
    async get<T>(key: string) {
      return store.has(key) ? (store.get(key) as T) : undefined;
    },
    async set<T>(key: string, value: T, ttl: number) {
      store.set(key, value);
      sets.push({ key, value, ttl });
    },
  };
}

describe("withCache", () => {
  it("runs the fn on a miss, stores the result under the ttl, and returns it", async () => {
    const cache = spyCache();
    const fn = vi.fn(async () => ({ n: 1 }));

    const result = await withCache("k", 60, fn, cache);

    expect(result).toEqual({ n: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.sets).toEqual([{ key: "k", value: { n: 1 }, ttl: 60 }]);
  });

  it("serves a hit without calling the fn again", async () => {
    const cache = spyCache();
    const fn = vi.fn(async () => "fresh");

    await withCache("k", 60, fn, cache);
    const second = await withCache("k", 60, fn, cache);

    expect(second).toBe("fresh");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("skips the write when cacheWhen rejects the result, so the next call re-runs", async () => {
    const cache = spyCache();
    const fn = vi
      .fn<() => Promise<{ ok: boolean }>>()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    const cacheWhen = (r: { ok: boolean }) => r.ok;

    const first = await withCache("k", 60, fn, cache, cacheWhen);
    const second = await withCache("k", 60, fn, cache, cacheWhen);

    expect(first).toEqual({ ok: false });
    expect(second).toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cache.sets).toHaveLength(1);
  });

  it("caches a null result — a stored null is still a hit", async () => {
    const cache = spyCache();
    const fn = vi.fn(async () => null);

    await withCache("k", 60, fn, cache);
    const second = await withCache("k", 60, fn, cache);

    expect(second).toBeNull();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("stores every result by default, including a falsy one", async () => {
    const cache = spyCache();
    await withCache("k", 30, async () => 0, cache);
    expect(cache.sets).toEqual([{ key: "k", value: 0, ttl: 30 }]);
  });
});
