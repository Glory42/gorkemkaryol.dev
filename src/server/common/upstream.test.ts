import { describe, expect, it } from "vitest";
import { createUpstreamClient } from "@/server/common/upstream";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";

function client(
  responses: CannedResponse[],
  calls: string[] = [],
  extra: Partial<Parameters<typeof createUpstreamClient>[0]> = {},
) {
  return createUpstreamClient({
    base: "https://api.example.dev/u/gk",
    defaultTtl: 300,
    runtime: createInMemoryRuntime({ responses, calls }),
    ...extra,
  });
}

describe("createUpstreamClient — get()", () => {
  it("requests base + path and returns the raw body", async () => {
    const calls: string[] = [];
    const c = client([{ url: "/profile", body: { name: "gk" } }], calls);
    const res = await c.get<{ name: string }>("/profile");
    expect(res).toEqual({ ok: true, data: { name: "gk" } });
    expect(calls).toEqual(["https://api.example.dev/u/gk/profile"]);
  });

  it("serves a repeat path from cache — one round-trip", async () => {
    const calls: string[] = [];
    const c = client([{ url: "/profile", body: { n: 1 } }], calls);
    await c.get("/profile");
    await c.get("/profile");
    expect(calls).toHaveLength(1);
  });

  it("keys distinct paths separately", async () => {
    const calls: string[] = [];
    const c = client(
      [
        { url: "/gk/alpha", body: { which: "a" } },
        { url: "/gk/beta", body: { which: "b" } },
      ],
      calls,
    );
    expect(await c.get("/alpha")).toEqual({ ok: true, data: { which: "a" } });
    expect(await c.get("/beta")).toEqual({ ok: true, data: { which: "b" } });
    expect(calls).toHaveLength(2);
  });

  it("short-circuits to the guard failure without a request", async () => {
    const calls: string[] = [];
    const c = client([{ url: "/x", body: {} }], calls, {
      guard: {
        ok: false,
        error: { code: "MISSING_ENV", message: "no username", retryable: false },
      },
    });
    const res = await c.get("/x");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("MISSING_ENV");
    expect(calls).toHaveLength(0);
  });

  it("isolates caches by scope — same path, different account", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({
      calls,
      responses: [
        { url: "/u/a/profile", body: { who: "a" } },
        { url: "/u/b/profile", body: { who: "b" } },
      ],
    });
    const a = createUpstreamClient({
      base: "https://api.example.dev/u/a",
      defaultTtl: 300,
      cacheScope: "svc:a",
      runtime,
    });
    const b = createUpstreamClient({
      base: "https://api.example.dev/u/b",
      defaultTtl: 300,
      cacheScope: "svc:b",
      runtime,
    });
    expect(await a.get("/profile")).toEqual({ ok: true, data: { who: "a" } });
    expect(await b.get("/profile")).toEqual({ ok: true, data: { who: "b" } });
    expect(calls).toHaveLength(2);
  });
});

describe("createUpstreamClient — gql()", () => {
  const OK = { url: "/graphql", body: { data: { viewer: { login: "gk" } } } };

  it("posts the query and flattens the envelope", async () => {
    const c = client([OK], [], { base: "https://api.example.dev/graphql" });
    const res = await c.gql<{ viewer: { login: string } }>("{ viewer { login } }");
    expect(res).toEqual({ ok: true, data: { viewer: { login: "gk" } } });
  });

  it("keys distinct variable sets separately — no collision", async () => {
    const calls: string[] = [];
    const c = client(
      [{ url: "/graphql", body: { data: { ok: true } } }],
      calls,
      { base: "https://api.example.dev/graphql" },
    );
    await c.gql("query Q($s: String!) { books(status: $s) { id } }", {
      variables: { s: "IS_READING" },
    });
    await c.gql("query Q($s: String!) { books(status: $s) { id } }", {
      variables: { s: "FINISHED" },
    });
    expect(calls).toHaveLength(2);
  });

  it("honours an explicit cacheKey when variables carry volatile values", async () => {
    const calls: string[] = [];
    const c = client(
      [{ url: "/graphql", body: { data: { ok: true } } }],
      calls,
      { base: "https://api.example.dev/graphql" },
    );
    await c.gql("query { now }", {
      variables: { at: "2026-08-29T10:00:00Z" },
      cacheKey: "now",
    });
    await c.gql("query { now }", {
      variables: { at: "2026-08-29T10:05:00Z" },
      cacheKey: "now",
    });
    expect(calls).toHaveLength(1);
  });
});
