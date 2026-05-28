const CACHE_ORIGIN = "https://portfolio-cache.internal";

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  if (typeof caches === "undefined") {
    return fn();
  }

  const store = await caches.open("default");
  const req = new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`);

  const hit = await store.match(req);
  if (hit) {
    return (await hit.json()) as T;
  }

  const result = await fn();

  await store.put(
    req,
    new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${ttlSeconds}`,
      },
    }),
  );

  return result;
}
