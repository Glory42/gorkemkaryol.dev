import { describe, expect, it } from "vitest";
import { getGithubProjects, getGithubShowcase, TOPIC_LISTS } from "@/server/github/github";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import type { RuntimeEnv } from "@/lib/env";

const ENV: RuntimeEnv = {
  GITHUB_TOKEN: "test-token",
  PUBLIC_GITHUB_USERNAME: "gk",
  LITERAL_EMAIL: "",
  LITERAL_PASSWORD: "",
  INTERIS_USERNAME: "",
  NASA_API_KEY: "",
};

function repoNode(over: Record<string, unknown> = {}) {
  return {
    name: "repo",
    description: "d",
    url: "https://github.com/gk/repo",
    stargazerCount: 1,
    updatedAt: "2026-01-01T00:00:00Z",
    isFork: false,
    repositoryTopics: { nodes: [{ topic: { name: "featured" } }] },
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
    ...over,
  };
}

function overviewBody(over: Record<string, unknown> = {}) {
  return {
    data: {
      list_featured: {
        nodes: [
          repoNode({ name: "newer", updatedAt: "2026-06-01T00:00:00Z" }),
          repoNode({ name: "older", updatedAt: "2026-02-01T00:00:00Z" }),
          repoNode({ name: "a-fork", isFork: true }),
        ],
      },
      list_showcase: {
        nodes: [
          repoNode({
            name: "shown",
            homepageUrl: "https://shown.example",
            repositoryTopics: {
              nodes: [{ topic: { name: "showcase" } }, { topic: { name: "rust" } }],
            },
          }),
          repoNode({ name: "no-site", homepageUrl: "" }),
        ],
      },
      repo0: repoNode({
        name: "WasteWise",
        url: "https://github.com/WasteWise-Project/WasteWise",
        updatedAt: "2026-05-01T00:00:00Z",
      }),
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 3,
            weeks: [
              {
                contributionDays: [
                  { date: "2026-01-01", contributionCount: 0, contributionLevel: "NONE" },
                  { date: "2026-01-02", contributionCount: 1, contributionLevel: "FIRST_QUARTILE" },
                  {
                    date: "2026-01-03",
                    contributionCount: 9,
                    contributionLevel: "FOURTH_QUARTILE",
                  },
                ],
              },
            ],
          },
        },
      },
      rateLimit: { limit: 5000, remaining: 4999, resetAt: "2026-01-01T01:00:00Z", cost: 1 },
      ...over,
    },
  };
}

function ctxFor(body: unknown, calls: string[] = []) {
  const responses: CannedResponse[] = [{ url: "api.github.com/graphql", body }];
  return sourceCtx({ runtime: createInMemoryRuntime({ responses, calls }) });
}

describe("getGithubProjects — mapping through the interface", () => {
  it("drops forks and keeps real repositories", async () => {
    const result = await getGithubProjects(ENV, ctxFor(overviewBody()));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const names = result.data.featured.map((p) => p.name);
    expect(names).not.toContain("a-fork");
    expect(names).toContain("newer");
  });

  it("splits featured (own) from contributed (external), each newest first", async () => {
    const result = await getGithubProjects(ENV, ctxFor(overviewBody()));
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.featured.map((p) => p.name)).toEqual(["newer", "older"]);
    expect(result.data.contributed.map((p) => p.name)).toEqual(["WasteWise"]);
  });

  it("returns showcase repos with their live site, or null when the Website field is empty", async () => {
    const result = await getGithubProjects(ENV, ctxFor(overviewBody()));
    if (!result.ok) throw new Error("expected ok");
    const byName = Object.fromEntries(result.data.showcase.map((p) => [p.name, p.homepageUrl]));
    expect(byName).toEqual({ shown: "https://shown.example", "no-site": null });
  });

  it.each(TOPIC_LISTS)(
    "orders the %s list by last code push, not by metadata edits",
    async (list) => {
      const body = overviewBody({
        [`list_${list}`]: {
          nodes: [
            repoNode({
              name: "retagged",
              updatedAt: "2026-09-01T00:00:00Z",
              pushedAt: "2026-01-01T00:00:00Z",
            }),
            repoNode({
              name: "active",
              updatedAt: "2026-03-01T00:00:00Z",
              pushedAt: "2026-08-01T00:00:00Z",
            }),
          ],
        },
      });
      const result = await getGithubProjects(ENV, ctxFor(body));
      if (!result.ok) throw new Error("expected ok");
      expect(result.data[list].map((p) => p.name)).toEqual(["active", "retagged"]);
    },
  );

  it("maps GitHub contribution levels to the 0-4 ramp", async () => {
    const result = await getGithubProjects(ENV, ctxFor(overviewBody()));
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.contributions?.days.map((d) => d.level)).toEqual([0, 1, 4]);
    expect(result.data.contributions?.totalContributions).toBe(3);
  });

  it("fails with RATE_LIMITED when the budget is exhausted", async () => {
    const body = overviewBody({
      rateLimit: { limit: 5000, remaining: 0, resetAt: "2026-01-01T01:00:00Z", cost: 1 },
    });
    const result = await getGithubProjects(ENV, ctxFor(body));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("RATE_LIMITED");
  });

  it("serves the second call from cache — one transport round-trip", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(overviewBody(), calls);
    await getGithubProjects(ENV, ctx);
    await getGithubProjects(ENV, ctx);
    expect(calls).toHaveLength(1);
  });

  it("reports MISSING_ENV without touching the network", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(overviewBody(), calls);
    const result = await getGithubProjects({ ...ENV, GITHUB_TOKEN: "" }, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("MISSING_ENV");
    expect(calls).toHaveLength(0);
  });
});

describe("getGithubShowcase — the home strip alone", () => {
  it("maps just the showcase list, so a cold home load skips the overview query", async () => {
    const calls: string[] = [];
    const body = {
      data: {
        list_showcase: {
          nodes: [
            repoNode({ name: "shown", homepageUrl: "https://shown.example" }),
            repoNode({ name: "a-fork", isFork: true }),
          ],
        },
      },
    };

    const result = await getGithubShowcase(ENV, ctxFor(body, calls));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.map((project) => project.name)).toEqual(["shown"]);
    expect(result.data[0].homepageUrl).toBe("https://shown.example");
    expect(calls).toHaveLength(1);
  });
});

describe("getGithubProjects — rate limit from response headers", () => {
  function ctxWithHeaders(body: unknown, headers: Record<string, string>) {
    return sourceCtx({
      runtime: createInMemoryRuntime({
        responses: [{ url: "api.github.com/graphql", body, headers }],
      }),
    });
  }

  it("derives rateLimit from x-ratelimit-* headers when the body omits it", async () => {
    const result = await getGithubProjects(
      ENV,
      ctxWithHeaders(overviewBody({ rateLimit: undefined }), {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "4998",
        "x-ratelimit-reset": "1735700400",
      }),
    );
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.rateLimit).toEqual({
      limit: 5000,
      remaining: 4998,
      resetAt: new Date(1735700400 * 1000).toISOString(),
      cost: 0,
    });
  });

  it("leaves rateLimit null when a header is non-numeric", async () => {
    const result = await getGithubProjects(
      ENV,
      ctxWithHeaders(overviewBody({ rateLimit: undefined }), {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "not-a-number",
        "x-ratelimit-reset": "1735700400",
      }),
    );
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.rateLimit).toBeNull();
  });
});
