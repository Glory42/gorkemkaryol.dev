import { describe, expect, it } from "vitest";
import type { RuntimeEnv } from "@/lib/env";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import { getRepoReadmeData } from "@/server/github/repo-readme";

const ENV: RuntimeEnv = {
  GITHUB_TOKEN: "t",
  PUBLIC_GITHUB_USERNAME: "gk",
  LITERAL_EMAIL: "",
  LITERAL_PASSWORD: "",
  INTERIS_USERNAME: "",
  NASA_API_KEY: "",
};

function ctxFor(body: unknown, calls: string[] = []) {
  const responses: CannedResponse[] = [{ url: "api.github.com/graphql", body }];
  return sourceCtx({ runtime: createInMemoryRuntime({ responses, calls }) });
}

function repository(over: Record<string, unknown> = {}) {
  return {
    data: {
      repository: {
        url: "https://github.com/gk/proj",
        defaultBranchRef: { name: "trunk" },
        ...over,
      },
    },
  };
}

describe("getRepoReadmeData", () => {
  it("reads an owned repo under PUBLIC_GITHUB_USERNAME and returns its README", async () => {
    const result = await getRepoReadmeData(
      ENV,
      ctxFor(repository({ readmeMd: { text: "# Proj" } })),
      "proj",
    );
    if (!result.ok || result.data === null) throw new Error("expected data");
    expect(result.data.owner).toBe("gk");
    expect(result.data.repo).toBe("proj");
    expect(result.data.defaultBranch).toBe("trunk");
    expect(result.data.readme).toBe("# Proj");
  });

  it("swaps the owner for a repo listed in EXTERNAL_REPOS", async () => {
    const result = await getRepoReadmeData(
      ENV,
      ctxFor(repository({ readmeMd: { text: "# WW" } })),
      "WasteWise",
    );
    if (!result.ok || result.data === null) throw new Error("expected data");
    expect(result.data.owner).toBe("WasteWise-Project");
  });

  it("walks the README blob fallback chain md -> mdx -> lower -> plain", async () => {
    const only = (key: string) =>
      getRepoReadmeData(ENV, ctxFor(repository({ [key]: { text: key } })), "proj");

    for (const key of ["readmeMdx", "readmeLower", "readmePlain"]) {
      const result = await only(key);
      if (!result.ok || result.data === null) throw new Error("expected data");
      expect(result.data.readme).toBe(key);
    }
  });

  it("prefers README.md when several blobs resolve", async () => {
    const result = await getRepoReadmeData(
      ENV,
      ctxFor(
        repository({
          readmeMd: { text: "md" },
          readmeMdx: { text: "mdx" },
          readmePlain: { text: "plain" },
        }),
      ),
      "proj",
    );
    expect(result.ok && result.data?.readme).toBe("md");
  });

  it("defaults the branch to main when defaultBranchRef is absent", async () => {
    const result = await getRepoReadmeData(
      ENV,
      ctxFor({
        data: {
          repository: {
            url: "https://github.com/gk/proj",
            readmeMd: { text: "x" },
          },
        },
      }),
      "proj",
    );
    expect(result.ok && result.data?.defaultBranch).toBe("main");
  });

  it("returns ok(null) when GitHub has no such repository", async () => {
    const result = await getRepoReadmeData(
      ENV,
      ctxFor({ data: { repository: null } }),
      "ghost",
    );
    expect(result).toEqual({ ok: true, data: null });
  });

  it("returns a null readme when the repo carries no blob", async () => {
    const result = await getRepoReadmeData(ENV, ctxFor(repository()), "proj");
    if (!result.ok || result.data === null) throw new Error("expected data");
    expect(result.data.readme).toBeNull();
  });

  it("propagates a GraphQL failure", async () => {
    const result = await getRepoReadmeData(
      ENV,
      ctxFor({ errors: [{ message: "boom" }] }),
      "proj",
    );
    expect(result.ok).toBe(false);
  });

  it("reports MISSING_ENV without touching the network", async () => {
    const calls: string[] = [];
    const result = await getRepoReadmeData(
      { ...ENV, GITHUB_TOKEN: "" },
      ctxFor(repository(), calls),
      "proj",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("MISSING_ENV");
    expect(calls).toHaveLength(0);
  });
});
