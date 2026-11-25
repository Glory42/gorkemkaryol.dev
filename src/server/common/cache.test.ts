import { describe, expect, it, vi } from "vitest";
import { readStaleCache, revalidateStaleCache, withCache } from "@/server/common/cache";
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

describe("readStaleCache", () => {
  it("returns the fallback and marks a miss stale", async () => {
    const cache = spyCache();
    const result = await readStaleCache({
      key: "read:miss",
      ttlSeconds: 60,
      fallback: "seed",
      cache,
    });

    expect(result).toEqual({ value: "seed", stale: true, cached: false });
  });

  it("serves a fresh cached value", async () => {
    const cache = spyCache();
    let now = 1_000;
    await revalidateStaleCache({
      key: "read:fresh",
      ttlSeconds: 60,
      fn: async () => "live",
      cache,
      now: () => now,
    });

    now = 1_000 + 59_000;
    const result = await readStaleCache({
      key: "read:fresh",
      ttlSeconds: 60,
      fallback: "seed",
      cache,
      now: () => now,
    });

    expect(result).toEqual({ value: "live", stale: false, cached: true });
  });

  it("still returns an expired value, marked stale", async () => {
    const cache = spyCache();
    let now = 1_000;
    await revalidateStaleCache({
      key: "read:expired",
      ttlSeconds: 60,
      fn: async () => "live",
      cache,
      now: () => now,
    });

    now = 1_000 + 61_000;
    const result = await readStaleCache({
      key: "read:expired",
      ttlSeconds: 60,
      fallback: "seed",
      cache,
      now: () => now,
    });

    expect(result).toEqual({ value: "live", stale: true, cached: true });
  });
  it("treats a legacy raw value as a miss instead of serving undefined", async () => {
    const cache = spyCache();
    // Before the envelope existed, the key held the bare result.
    await cache.set("read:legacy", { ok: true, data: "old" }, 60);

    const result = await readStaleCache({
      key: "read:legacy",
      ttlSeconds: 60,
      fallback: "seed",
      cache,
    });

    expect(result).toEqual({ value: "seed", stale: true, cached: false });
  });
});

describe("revalidateStaleCache", () => {
  it("runs the fn on a miss and stores the result with a long ttl", async () => {
    const cache = spyCache();
    const fn = vi.fn(async () => "live");

    const result = await revalidateStaleCache({
      key: "reval:miss",
      ttlSeconds: 60,
      fn,
      cache,
    });

    expect(result).toBe("live");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.sets).toHaveLength(1);
    expect(cache.sets[0].key).toBe("reval:miss");
    expect(cache.sets[0].value).toMatchObject({ value: "live" });
    expect(cache.sets[0].ttl).toBeGreaterThan(60);
  });

  it("does not call the fn while the cached value is fresh", async () => {
    const cache = spyCache();
    const fn = vi.fn(async () => "live");
    const options = { key: "reval:fresh", ttlSeconds: 60, fn, cache };

    await revalidateStaleCache(options);
    const second = await revalidateStaleCache(options);

    expect(second).toBe("live");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("refreshes an expired value", async () => {
    const cache = spyCache();
    let now = 1_000;
    const fn = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second");
    const options = {
      key: "reval:expired",
      ttlSeconds: 60,
      fn,
      cache,
      now: () => now,
    };

    expect(await revalidateStaleCache(options)).toBe("first");

    now = 1_000 + 61_000;
    expect(await revalidateStaleCache(options)).toBe("second");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("keeps a good snapshot when cacheWhen rejects a failed refresh", async () => {
    const cache = spyCache();
    let now = 1_000;
    const fn = vi
      .fn<() => Promise<{ ok: boolean; value: string }>>()
      .mockResolvedValueOnce({ ok: true, value: "good" })
      .mockResolvedValue({ ok: false, value: "bad" });
    const options = {
      key: "reval:guard",
      ttlSeconds: 60,
      fn,
      cache,
      cacheWhen: (result: { ok: boolean }) => result.ok,
      now: () => now,
    };

    expect(await revalidateStaleCache(options)).toEqual({
      ok: true,
      value: "good",
    });

    now = 1_000 + 61_000;
    expect(await revalidateStaleCache(options)).toEqual({
      ok: false,
      value: "bad",
    });

    expect(cache.sets).toHaveLength(1);
    const read = await readStaleCache({
      key: "reval:guard",
      ttlSeconds: 60,
      fallback: { ok: false, value: "seed" },
      cache,
      now: () => now,
    });
    expect(read.value).toEqual({ ok: true, value: "good" });
  });

  it("shares one refresh between concurrent callers", async () => {
    const cache = spyCache();
    let resolveRefresh: (value: string) => void = () => {};
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const options = { key: "reval:inflight", ttlSeconds: 60, fn, cache };

    const first = revalidateStaleCache(options);
    const second = revalidateStaleCache(options);
    await vi.waitFor(() => expect(fn).toHaveBeenCalledTimes(1));

    resolveRefresh("live");
    expect(await first).toBe("live");
    expect(await second).toBe("live");
  });

  it("overwrites a legacy raw value with the current envelope", async () => {
    const cache = spyCache();
    await cache.set("reval:legacy", "old", 60);
    const fn = vi.fn(async () => "live");

    const result = await revalidateStaleCache({
      key: "reval:legacy",
      ttlSeconds: 60,
      fn,
      cache,
      now: () => 1_000,
    });

    expect(result).toBe("live");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(cache.sets.at(-1)?.value).toEqual({ value: "live", storedAt: 1_000 });
  });
});
