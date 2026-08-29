import { describe, expect, it } from "vitest";
import { getGithubProjects } from "@/server/github";
import { createInMemoryRuntime, type CannedResponse } from "@/server/runtime";
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
      search: {
        nodes: [
          repoNode({ name: "newer", updatedAt: "2026-06-01T00:00:00Z" }),
          repoNode({ name: "older", updatedAt: "2026-02-01T00:00:00Z" }),
          repoNode({ name: "a-fork", isFork: true }),
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
                  { date: "2026-01-03", contributionCount: 9, contributionLevel: "FOURTH_QUARTILE" },
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

function runtimeFor(body: unknown, calls: string[] = []) {
  const responses: CannedResponse[] = [{ url: "api.github.com/graphql", body }];
  return createInMemoryRuntime({ responses, calls });
}

describe("getGithubProjects — mapping through the interface", () => {
  it("drops forks and keeps real repositories", async () => {
    const result = await getGithubProjects(ENV, runtimeFor(overviewBody()));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const names = result.data.featured.map((p) => p.name);
    expect(names).not.toContain("a-fork");
    expect(names).toContain("newer");
  });

  it("splits featured (own) from contributed (external), each newest first", async () => {
    const result = await getGithubProjects(ENV, runtimeFor(overviewBody()));
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.featured.map((p) => p.name)).toEqual(["newer", "older"]);
    expect(result.data.contributed.map((p) => p.name)).toEqual(["WasteWise"]);
  });

  it("maps GitHub contribution levels to the 0-4 ramp", async () => {
    const result = await getGithubProjects(ENV, runtimeFor(overviewBody()));
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.contributions?.days.map((d) => d.level)).toEqual([0, 1, 4]);
    expect(result.data.contributions?.totalContributions).toBe(3);
  });

  it("fails with RATE_LIMITED when the budget is exhausted", async () => {
    const body = overviewBody({
      rateLimit: { limit: 5000, remaining: 0, resetAt: "2026-01-01T01:00:00Z", cost: 1 },
    });
    const result = await getGithubProjects(ENV, runtimeFor(body));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("RATE_LIMITED");
  });

  it("serves the second call from cache — one transport round-trip", async () => {
    const calls: string[] = [];
    const runtime = runtimeFor(overviewBody(), calls);
    await getGithubProjects(ENV, runtime);
    await getGithubProjects(ENV, runtime);
    expect(calls).toHaveLength(1);
  });

  it("reports MISSING_ENV without touching the network", async () => {
    const calls: string[] = [];
    const runtime = runtimeFor(overviewBody(), calls);
    const result = await getGithubProjects({ ...ENV, GITHUB_TOKEN: "" }, runtime);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("MISSING_ENV");
    expect(calls).toHaveLength(0);
  });
});
