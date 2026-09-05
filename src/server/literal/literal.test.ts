import { describe, expect, it, vi } from "vitest";
import type { RuntimeEnv } from "@/lib/env";
import { createInMemoryRuntime } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import { withLiteralSession } from "@/server/literal/literal";

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

type Session = { authHeaders: { Authorization: string }; profileId: string };
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

  it("runs the callback with a bearer token after a successful login", async () => {
    const calls: string[] = [];
    const runtime = createInMemoryRuntime({
      calls,
      responses: [
        {
          url: LOGIN_URL,
          body: { data: { login: { token: "t0k3n", profile: { id: "p1" } } } },
        },
      ],
    });
    const use = spy();

    const res = await withLiteralSession(fakeEnv(CREDS), sourceCtx({ runtime }), use);

    expect(res).toEqual({ ok: true, data: "done" });
    expect(use).toHaveBeenCalledTimes(1);
    const session = use.mock.calls[0][0];
    expect(session.authHeaders.Authorization).toBe("Bearer t0k3n");
    expect(session.profileId).toBe("p1");
    expect(calls).toHaveLength(1);
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
});
