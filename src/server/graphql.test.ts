import { describe, expect, it } from "vitest";
import { graphqlRequest } from "@/server/graphql";
import { createInMemoryRuntime } from "@/server/runtime";

const URL = "https://api.example.dev/graphql";

function httpWith(body: unknown, status = 200) {
  return createInMemoryRuntime({
    responses: [{ url: "/graphql", body, status }],
  }).http;
}

describe("graphqlRequest", () => {
  it("flattens the envelope to the query data on success", async () => {
    const result = await graphqlRequest<{ viewer: { login: string } }>({
      url: URL,
      query: "{ viewer { login } }",
      http: httpWith({ data: { viewer: { login: "gk" } } }),
    });

    expect(result).toEqual({ ok: true, data: { viewer: { login: "gk" } } });
  });

  it("maps a populated errors[] to UPSTREAM_ERROR", async () => {
    const result = await graphqlRequest({
      url: URL,
      query: "{ x }",
      label: "Literal",
      http: httpWith({ errors: [{ message: "Field 'x' doesn't exist" }] }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UPSTREAM_ERROR");
      expect(result.error.message).toBe("Literal GraphQL query failed");
      expect(result.error.details).toContain("doesn't exist");
    }
  });

  it("maps a rate-limit error message to RATE_LIMITED + retryable", async () => {
    const result = await graphqlRequest({
      url: URL,
      query: "{ x }",
      http: httpWith({ errors: [{ message: "API rate limit exceeded for user" }] }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RATE_LIMITED");
      expect(result.error.retryable).toBe(true);
    }
  });

  it("fails when the body carries neither data nor errors", async () => {
    const result = await graphqlRequest({
      url: URL,
      query: "{ x }",
      http: httpWith({}),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("UPSTREAM_ERROR");
  });

  it("hands the transport status + headers to onMeta", async () => {
    let seen: { status: number; headers: Headers } | null = null;
    await graphqlRequest({
      url: URL,
      query: "{ viewer { login } }",
      http: createInMemoryRuntime({
        responses: [
          {
            url: "/graphql",
            body: { data: { viewer: { login: "gk" } } },
            headers: { "x-ratelimit-remaining": "42" },
          },
        ],
      }).http,
      onMeta: (meta) => {
        seen = meta;
      },
    });

    expect(seen).not.toBeNull();
    expect(seen!.headers.get("x-ratelimit-remaining")).toBe("42");
  });
});
