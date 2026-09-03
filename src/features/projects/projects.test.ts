import { describe, expect, it } from "vitest";
import {
  getProjects,
  getProjectReadme,
} from "@/features/projects/projects";
import { manualProjects } from "@/features/projects/manual-projects";
import { createInMemoryRuntime } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import type { RuntimeEnv } from "@/lib/env";

const ENV: RuntimeEnv = {
  GITHUB_TOKEN: "t",
  PUBLIC_GITHUB_USERNAME: "gk",
  LITERAL_EMAIL: "",
  LITERAL_PASSWORD: "",
  INTERIS_USERNAME: "",
  NASA_API_KEY: "",
};

function repoNode(name: string) {
  return {
    name,
    description: "d",
    url: `https://github.com/gk/${name}`,
    stargazerCount: 0,
    updatedAt: "2026-01-01T00:00:00Z",
    isFork: false,
    repositoryTopics: { nodes: [] },
    primaryLanguage: null,
  };
}

const overviewBody = {
  data: {
    search: { nodes: [repoNode("own-featured")] },
    repo0: repoNode("WasteWise"),
    user: null,
    rateLimit: { limit: 5000, remaining: 5000, resetAt: "", cost: 1 },
  },
};

function ctxWith(body: unknown, calls: string[] = []) {
  return sourceCtx({
    runtime: createInMemoryRuntime({
      responses: [{ url: "api.github.com/graphql", body }],
      calls,
    }),
  });
}

describe("getProjects", () => {
  it("leads the contributed column with manual cards, then GitHub repos", async () => {
    const result = await getProjects(ENV, ctxWith(overviewBody));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const names = result.data.contributed.map((p) => p.name);
    expect(names.slice(0, manualProjects.length)).toEqual(
      manualProjects.map((p) => p.card.name),
    );
    expect(names).toContain("WasteWise");
    expect(result.data.featured.map((p) => p.name)).toEqual(["own-featured"]);
    expect(result.data.githubError).toBeNull();
  });

  it("keeps manual cards and reports githubError on a GitHub outage", async () => {
    const result = await getProjects(
      ENV,
      ctxWith({ errors: [{ message: "boom" }] }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.featured).toEqual([]);
    expect(result.data.contributed.map((p) => p.name)).toEqual(
      manualProjects.map((p) => p.card.name),
    );
    expect(result.data.githubError).not.toBeNull();
  });
});

describe("getProjectReadme", () => {
  it("renders a manual project without touching the network", async () => {
    const calls: string[] = [];
    const ctx = ctxWith(overviewBody, calls);
    const result = await getProjectReadme(ENV, ctx, "Gathin");
    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) throw new Error("expected a manual readme");
    expect(result.data.kind).toBe("manual");
    expect(result.data.title).toBe("Gathin");
    expect(result.data.url).toBe("https://gathin.com");
    expect(result.data.hadError).toBe(false);
    expect(result.data.html.length).toBeGreaterThan(0);
    expect(calls).toHaveLength(0);
  });

  it("resolves a manual slug case-insensitively", async () => {
    const result = await getProjectReadme(ENV, ctxWith(overviewBody), "gathin");
    expect(result.ok && result.data?.title).toBe("Gathin");
  });

  it("returns null when GitHub has no such repository", async () => {
    const result = await getProjectReadme(
      ENV,
      ctxWith({ data: { repository: null } }),
      "ghost-repo",
    );
    expect(result).toEqual({ ok: true, data: null });
  });

  it("renders a GitHub README to html with a github kind", async () => {
    const body = {
      data: {
        repository: {
          url: "https://github.com/gk/real",
          defaultBranchRef: { name: "main" },
          readmeMd: { text: "# Real\n\nhello" },
        },
      },
    };
    const result = await getProjectReadme(ENV, ctxWith(body), "real");
    if (!result.ok || !result.data) throw new Error("expected a github readme");
    expect(result.data.kind).toBe("github");
    expect(result.data.title).toBe("real");
    expect(result.data.html).toContain("<h1");
  });

  it("fails when the GitHub request fails", async () => {
    const result = await getProjectReadme(
      { ...ENV, GITHUB_TOKEN: "" },
      ctxWith(overviewBody),
      "real",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("MISSING_ENV");
  });
});
