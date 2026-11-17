import { describe, expect, it, vi } from "vitest";
import type { RuntimeEnv } from "@/lib/env";
import { createInMemoryRuntime } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import {
  getAllBooksData,
  getCurrentlyReading,
  getFavoriteBooks,
  withLiteralSession,
} from "@/server/literal/literal";

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

const CREDS = { LITERAL_EMAIL: "me@example.com", LITERAL_PASSWORD: "pw" };
const LOGIN_URL = "api.literal.club/graphql";

type Session = Parameters<Parameters<typeof withLiteralSession>[2]>[0];
const spy = () =>
  vi.fn((_session: Session) => Promise.resolve({ ok: true as const, data: "done" }));

describe("withLiteralSession", () => {
  it("fails without running the callback when credentials are missing", async () => {
    const use = spy();
    const runtime = createInMemoryRuntime({ responses: [] });

    const res = await withLiteralSession(fakeEnv(), sourceCtx({ runtime }), use);

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("MISSING_ENV");
    expect(use).not.toHaveBeenCalled();
  });

  it("hands the callback a gql that sends the bearer token", async () => {
    const base = createInMemoryRuntime({
      responses: [
        {
          url: LOGIN_URL,
          body: { data: { login: { token: "t0k3n", profile: { id: "p1" } } } },
        },
      ],
    });
    const auth: (string | null)[] = [];
    const runtime = {
      ...base,
      http: {
        fetch: (url: string, init?: RequestInit) => {
          auth.push(new Headers(init?.headers).get("Authorization"));
          return base.http.fetch(url, init);
        },
      },
    };

    const res = await withLiteralSession(
      fakeEnv(CREDS),
      sourceCtx({ runtime }),
      async (session) => {
        expect(session.profileId).toBe("p1");
        return session.gql("query Me { me { id } }");
      },
    );

    expect(res.ok).toBe(true);
    expect(auth).toEqual([null, "Bearer t0k3n"]);
  });

  it("propagates a login failure", async () => {
    const use = spy();
    const runtime = createInMemoryRuntime({
      responses: [{ url: LOGIN_URL, body: { errors: [{ message: "bad password" }] } }],
    });

    const res = await withLiteralSession(fakeEnv(CREDS), sourceCtx({ runtime }), use);

    expect(res.ok).toBe(false);
    expect(use).not.toHaveBeenCalled();
  });

  it("fails UNAUTHORIZED when login returns no token or profile", async () => {
    const use = spy();
    const runtime = createInMemoryRuntime({
      responses: [
        { url: LOGIN_URL, body: { data: { login: { token: "", profile: { id: "" } } } } },
      ],
    });

    const res = await withLiteralSession(fakeEnv(CREDS), sourceCtx({ runtime }), use);

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("UNAUTHORIZED");
    expect(use).not.toHaveBeenCalled();
  });
});

const book = (id: string) => ({
  id,
  slug: id,
  title: id.toUpperCase(),
  cover: `https://img/${id}.jpg`,
  authors: [{ name: "Author" }],
});

// One canned body serves login and every read, since all Literal queries share one endpoint.
function literalRuntime(over: Record<string, unknown> = {}) {
  return createInMemoryRuntime({
    responses: [
      {
        url: LOGIN_URL,
        body: {
          data: {
            login: { token: "t0k3n", profile: { id: "p1" } },
            booksByReadingStateAndProfile: [book("a"), book("b"), book("c")],
            shelf: { id: "s1", slug: "favorits", books: [book("x"), book("y"), book("z")] },
            ...over,
          },
        },
      },
    ],
  });
}

describe("getCurrentlyReading / getFavoriteBooks", () => {
  it("returns the in-progress books", async () => {
    const res = await getCurrentlyReading(fakeEnv(CREDS), sourceCtx({ runtime: literalRuntime() }), 3);
    if (!res.ok) throw new Error("expected ok");
    expect(res.data.map((b) => b.id)).toEqual(["a", "b", "c"]);
  });

  it("caps favourites at two", async () => {
    const res = await getFavoriteBooks(fakeEnv(CREDS), sourceCtx({ runtime: literalRuntime() }));
    if (!res.ok) throw new Error("expected ok");
    expect(res.data.map((b) => b.id)).toEqual(["x", "y"]);
  });

  it("propagates a missing-credentials failure without a network hit", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({ responses: [], calls });
    const res = await getCurrentlyReading(fakeEnv(), sourceCtx({ runtime }), 2);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("MISSING_ENV");
    expect(calls).toHaveLength(0);
  });
});

describe("getAllBooksData", () => {
  it("returns the reading and finished lists, defaulting each to an array", async () => {
    const runtime = literalRuntime();
    const res = await getAllBooksData(fakeEnv(CREDS), sourceCtx({ runtime }));
    if (!res.ok) throw new Error("expected ok");
    expect(res.data.currentlyReading.map((b) => b.id)).toEqual(["a", "b", "c"]);
    expect(res.data.finishedBooks.map((b) => b.id)).toEqual(["a", "b", "c"]);
  });
});
