import { describe, expect, it } from "vitest";
import {
  createSourceClient,
  defineSource,
  resolveSources,
  sourceCtx,
} from "@/server/common/source";
import { fail, ok } from "@/server/common/http";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";
import type { RuntimeEnv } from "@/lib/env";

function fakeEnv(overrides: Partial<RuntimeEnv> = {}): RuntimeEnv {
  return {
    GITHUB_TOKEN: "",
    PUBLIC_GITHUB_USERNAME: "",
    LITERAL_EMAIL: "",
    LITERAL_PASSWORD: "",
    INTERIS_USERNAME: "",
    NASA_API_KEY: "",
    ...overrides,
  };
}

function client(
  responses: CannedResponse[],
  calls: string[] = [],
  extra: Partial<Parameters<typeof createSourceClient>[0]> = {},
) {
  return createSourceClient({
    base: "https://api.example.dev/u/gk",
    scope: "svc:gk",
    defaultTtl: 300,
    runtime: createInMemoryRuntime({ responses, calls }),
    ...extra,
  });
}

function gqlClient(responses: CannedResponse[], calls: string[] = []) {
  return client(responses, calls, { base: "https://api.example.dev/graphql" });
}

describe("createSourceClient — get()", () => {
  it("requests base + path and returns the raw body", async () => {
    const calls: string[] = [];
    const c = client([{ url: "/profile", body: { name: "gk" } }], calls);
    expect(await c.get<{ name: string }>("/profile")).toEqual({
      ok: true,
      data: { name: "gk" },
    });
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

  it("does not cache a failed fetch — the next call retries", async () => {
    const calls: string[] = [];
    const c = client([{ url: "/x", status: 503, body: { down: true } }], calls);
    const first = await c.get("/x");
    const second = await c.get("/x");
    expect(first.ok).toBe(false);
    expect(second.ok).toBe(false);
    expect(calls.length).toBeGreaterThan(1);
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
    const a = createSourceClient({
      base: "https://api.example.dev/u/a",
      scope: "svc:a",
      defaultTtl: 300,
      runtime,
    });
    const b = createSourceClient({
      base: "https://api.example.dev/u/b",
      scope: "svc:b",
      defaultTtl: 300,
      runtime,
    });
    expect(await a.get("/profile")).toEqual({ ok: true, data: { who: "a" } });
    expect(await b.get("/profile")).toEqual({ ok: true, data: { who: "b" } });
    expect(calls).toHaveLength(2);
  });
});

describe("createSourceClient — gql()", () => {
  const OK = { url: "/graphql", body: { data: { viewer: { login: "gk" } } } };

  it("posts the query and flattens the envelope", async () => {
    const res = await gqlClient([OK]).gql<{ viewer: { login: string } }>(
      "{ viewer { login } }",
    );
    expect(res).toEqual({ ok: true, data: { viewer: { login: "gk" } } });
  });

  it("keys distinct variable sets separately — no collision", async () => {
    const calls: string[] = [];
    const c = gqlClient([{ url: "/graphql", body: { data: { ok: true } } }], calls);
    await c.gql("query Q($s: String!) { books(status: $s) { id } }", {
      variables: { s: "IS_READING" },
    });
    await c.gql("query Q($s: String!) { books(status: $s) { id } }", {
      variables: { s: "FINISHED" },
    });
    expect(calls).toHaveLength(2);
  });

  it("honours cacheDiscriminant when variables carry volatile values", async () => {
    const calls: string[] = [];
    const c = gqlClient([{ url: "/graphql", body: { data: { ok: true } } }], calls);
    await c.gql("query { now }", {
      variables: { at: "2026-08-29T10:00:00Z" },
      cacheDiscriminant: "now",
    });
    await c.gql("query { now }", {
      variables: { at: "2026-08-29T10:05:00Z" },
      cacheDiscriminant: "now",
    });
    expect(calls).toHaveLength(1);
  });

  it("does not cache a GraphQL failure — the next call retries", async () => {
    const calls: string[] = [];
    const c = gqlClient(
      [{ url: "/graphql", body: { errors: [{ message: "boom" }] } }],
      calls,
    );
    const first = await c.gql("{ viewer { login } }");
    const second = await c.gql("{ viewer { login } }");
    expect(first.ok).toBe(false);
    expect(second.ok).toBe(false);
    expect(calls).toHaveLength(2);
  });
});

describe("defineSource", () => {
  const define = () =>
    defineSource({
      envKeys: ["INTERIS_USERNAME"],
      scope: (e) => `interis:${e.INTERIS_USERNAME}`,
      base: (e) => `https://api.example.dev/u/${e.INTERIS_USERNAME}`,
      defaultTtl: 300,
    });

  it("derives base + scope from env and reaches the upstream", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({
      calls,
      responses: [{ url: "/u/gk/profile", body: { name: "gk" } }],
    });
    const c = define()(fakeEnv({ INTERIS_USERNAME: "gk" }), sourceCtx({ runtime }));
    expect(await c.get("/profile")).toEqual({ ok: true, data: { name: "gk" } });
    expect(calls).toEqual(["https://api.example.dev/u/gk/profile"]);
  });

  it("short-circuits every call with MISSING_ENV when a key is absent", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({
      calls,
      responses: [{ url: "/profile", body: {} }],
    });
    const c = define()(fakeEnv(), sourceCtx({ runtime }));
    const res = await c.get("/profile");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_ENV");
      expect(res.error.details).toContain("INTERIS_USERNAME");
    }
    expect(calls).toHaveLength(0);
  });

  it("keys the cache by the derived scope — different accounts don't share", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({
      calls,
      responses: [
        { url: "/u/a/profile", body: { who: "a" } },
        { url: "/u/b/profile", body: { who: "b" } },
      ],
    });
    const make = define();
    const a = make(fakeEnv({ INTERIS_USERNAME: "a" }), sourceCtx({ runtime }));
    const b = make(fakeEnv({ INTERIS_USERNAME: "b" }), sourceCtx({ runtime }));
    expect(await a.get("/profile")).toEqual({ ok: true, data: { who: "a" } });
    expect(await b.get("/profile")).toEqual({ ok: true, data: { who: "b" } });
    expect(calls).toHaveLength(2);
    await a.get("/profile");
    expect(calls).toHaveLength(2);
  });
});

describe("defineSource — optional keys and query auth", () => {
  const define = () =>
    defineSource({
      envKeys: [],
      optionalEnvKeys: ["NASA_API_KEY"],
      scope: () => "nasa",
      base: () => "https://api.example.dev",
      query: (e) => ({ api_key: e.NASA_API_KEY || "DEMO_KEY" }),
      defaultTtl: 300,
    });

  it("appends the query to every get, reading an optional key when set", async () => {
    const calls: string[] = [];
    const ctx = () =>
      sourceCtx({
        runtime: createInMemoryRuntime({ calls, responses: [{ url: "/feed", body: {} }] }),
      });
    await define()(fakeEnv({ NASA_API_KEY: "k1" }), ctx()).get("/feed?d=1");
    await define()(fakeEnv(), ctx()).get("/feed");
    expect(calls).toEqual([
      "https://api.example.dev/feed?d=1&api_key=k1",
      "https://api.example.dev/feed?api_key=DEMO_KEY",
    ]);
  });

  it("keeps the query out of the cache key", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({ calls, responses: [{ url: "/feed", body: { n: 1 } }] });
    const make = define();
    await make(fakeEnv({ NASA_API_KEY: "k1" }), sourceCtx({ runtime })).get("/feed");
    const second = await make(fakeEnv({ NASA_API_KEY: "k2" }), sourceCtx({ runtime })).get("/feed");
    expect(second).toEqual({ ok: true, data: { n: 1 } });
    expect(calls).toHaveLength(1);
  });
});

describe("resolveSources", () => {
  it("runs every source under its key, each failing independently", async () => {
    const results = await resolveSources(
      {
        good: () => ok(1),
        bad: () =>
          fail({ code: "UPSTREAM_ERROR", message: "down", retryable: true, details: "secret" }),
      },
      fakeEnv(),
      sourceCtx({ runtime: createInMemoryRuntime() }),
    );
    expect(results.good).toEqual({ ok: true, data: 1 });
    expect(results.bad).toEqual({
      ok: false,
      error: { code: "UPSTREAM_ERROR", message: "down", retryable: true },
    });
  });

  it("hands each source the same env and ctx", async () => {
    const ctx = sourceCtx({ runtime: createInMemoryRuntime() });
    const env = fakeEnv({ INTERIS_USERNAME: "gk" });
    const results = await resolveSources(
      { seen: (e, c) => ok(e.INTERIS_USERNAME === "gk" && c === ctx) },
      env,
      ctx,
    );
    expect(results.seen).toEqual({ ok: true, data: true });
  });
});
