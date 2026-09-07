import { describe, expect, it } from "vitest";
import type { ValidationError } from "@/lib/env";
import {
  envFail,
  fail,
  ok,
  publicResult,
  requestJsonWithRetry,
  type ServiceError,
  type ServiceResult,
} from "@/server/common/http";
import type { HttpPort } from "@/server/common/runtime";

type Step = () => Promise<Response> | Response;

// A transport that plays one scripted step per attempt and counts calls.
function scriptedHttp(steps: Step[]): { http: HttpPort; calls: () => number } {
  let i = 0;
  return {
    calls: () => i,
    http: {
      async fetch() {
        const step = steps[Math.min(i, steps.length - 1)];
        i += 1;
        return step();
      },
    },
  };
}

const json = (body: unknown, status = 200): Step => () =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("requestJsonWithRetry — success shape", () => {
  it("returns status, headers and the parsed payload", async () => {
    const { http } = scriptedHttp([
      () =>
        new Response(JSON.stringify({ hello: "world" }), {
          status: 201,
          headers: { "x-trace": "abc" },
        }),
    ]);

    const res = await requestJsonWithRetry<{ hello: string }>({
      url: "https://x.dev",
      retries: 0,
      http,
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.status).toBe(201);
    expect(res.data.headers.get("x-trace")).toBe("abc");
    expect(res.data.data).toEqual({ hello: "world" });
  });

  it("treats an empty body as an empty object", async () => {
    const { http } = scriptedHttp([() => new Response("", { status: 200 })]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 0, http });
    expect(res.ok && res.data.data).toEqual({});
  });

  it("fails INVALID_JSON on an unparseable body without retrying", async () => {
    const { http, calls } = scriptedHttp([
      () => new Response("not json", { status: 200 }),
    ]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 3, http });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_JSON");
      expect(res.error.retryable).toBe(false);
    }
    expect(calls()).toBe(1);
  });
});

describe("requestJsonWithRetry — status mapping", () => {
  it("maps 401 to UNAUTHORIZED and carries the status", async () => {
    const { http } = scriptedHttp([json({ message: "nope" }, 401)]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 0, http });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNAUTHORIZED");
      expect(res.error.status).toBe(401);
      expect(res.error.retryable).toBe(false);
    }
  });

  it("maps 429 to RATE_LIMITED", async () => {
    const { http } = scriptedHttp([json({}, 429)]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 0, http });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("RATE_LIMITED");
  });

  it("maps a plain 5xx to HTTP_ERROR, retryable, with a truncated body", async () => {
    const { http } = scriptedHttp([json({ detail: "x".repeat(500) }, 500)]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 0, http });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("HTTP_ERROR");
      expect(res.error.retryable).toBe(true);
      expect(res.error.details?.length).toBeLessThanOrEqual(240);
    }
  });
});

describe("requestJsonWithRetry — retries and transport errors", () => {
  it("retries a 503 and returns the following success", async () => {
    const { http, calls } = scriptedHttp([json({}, 503), json({ ok: 1 })]);
    const res = await requestJsonWithRetry<{ ok: number }>({
      url: "https://x.dev",
      retries: 1,
      http,
    });
    expect(res.ok && res.data.data).toEqual({ ok: 1 });
    expect(calls()).toBe(2);
  });

  it("gives up after the retry budget and reports the last failure", async () => {
    const { http, calls } = scriptedHttp([json({}, 503)]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 1, http });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("HTTP_ERROR");
    expect(calls()).toBe(2);
  });

  it("maps an aborted request to TIMEOUT", async () => {
    const http: HttpPort = {
      fetch: (_url, init) =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    };
    const res = await requestJsonWithRetry({
      url: "https://x.dev",
      timeoutMs: 10,
      retries: 0,
      http,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("TIMEOUT");
      expect(res.error.retryable).toBe(true);
    }
  });

  it("maps a client-disconnect TypeError to a non-retryable NETWORK_ERROR", async () => {
    const { http } = scriptedHttp([
      () => {
        throw new TypeError("Network connection lost: client disconnected");
      },
    ]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 2, http });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("NETWORK_ERROR");
      expect(res.error.retryable).toBe(false);
    }
  });

  it("maps a generic throw to a retryable NETWORK_ERROR after the budget", async () => {
    const { http } = scriptedHttp([
      () => {
        throw new Error("boom");
      },
    ]);
    const res = await requestJsonWithRetry({ url: "https://x.dev", retries: 0, http });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("NETWORK_ERROR");
      expect(res.error.retryable).toBe(true);
    }
  });
});

describe("publicResult", () => {
  it("strips internal details but keeps status on a failure", () => {
    const internal: ServiceResult<never> = fail({
      code: "HTTP_ERROR",
      message: "Upstream request failed with status 500",
      status: 500,
      retryable: true,
      details: "secret upstream body",
    });
    expect(publicResult(internal)).toEqual({
      ok: false,
      error: {
        code: "HTTP_ERROR",
        message: "Upstream request failed with status 500",
        status: 500,
        retryable: true,
      },
    });
  });

  it("omits status when the internal error had none", () => {
    const result = publicResult(
      fail({ code: "TIMEOUT", message: "timed out", retryable: true }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect("status" in result.error).toBe(false);
  });

  it("passes a successful result through untouched", () => {
    const success = ok({ n: 1 });
    expect(publicResult(success)).toBe(success);
  });
});

describe("envFail", () => {
  it("adapts a MISSING_ENV validation error onto the ServiceError channel", () => {
    const error: ValidationError = {
      code: "MISSING_ENV",
      message: "Missing required environment binding(s): A, B",
      fields: ["GITHUB_TOKEN", "PUBLIC_GITHUB_USERNAME"],
    };
    const result = envFail(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const e: ServiceError = result.error;
      expect(e.code).toBe("MISSING_ENV");
      expect(e.retryable).toBe(false);
      expect(e.details).toBe("GITHUB_TOKEN, PUBLIC_GITHUB_USERNAME");
    }
  });
});
