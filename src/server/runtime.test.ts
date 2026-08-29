import { describe, expect, it } from "vitest";
import { createInMemoryRuntime } from "@/server/runtime";

describe("createInMemoryRuntime — cache port", () => {
  it("round-trips a value", async () => {
    const { cache } = createInMemoryRuntime();
    await cache.set("k", { hello: "world" }, 60);
    expect(await cache.get("k")).toEqual({ hello: "world" });
  });

  it("misses on an unknown key", async () => {
    const { cache } = createInMemoryRuntime();
    expect(await cache.get("nope")).toBeUndefined();
  });

  it("expires entries against the injected clock", async () => {
    let now = 1_000;
    const { cache } = createInMemoryRuntime({ now: () => now });
    await cache.set("k", "v", 10); // expires at 11_000
    now = 10_999;
    expect(await cache.get("k")).toBe("v");
    now = 11_000;
    expect(await cache.get("k")).toBeUndefined();
  });
});

describe("createInMemoryRuntime — http port", () => {
  it("matches a canned response by URL substring and records the call", async () => {
    const calls: string[] = [];
    const { http } = createInMemoryRuntime({
      calls,
      responses: [{ url: "/profile", body: { name: "gk" } }],
    });

    const res = await http.fetch("https://api.example.dev/v1/profile?x=1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: "gk" });
    expect(calls).toEqual(["https://api.example.dev/v1/profile?x=1"]);
  });

  it("returns 599 when nothing matches", async () => {
    const { http } = createInMemoryRuntime({ responses: [] });
    const res = await http.fetch("https://api.example.dev/x");
    expect(res.status).toBe(599);
  });
});
