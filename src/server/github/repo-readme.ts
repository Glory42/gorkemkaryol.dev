import type { RuntimeEnv } from "@/lib/env";
import { fail, ok, type ServiceResult } from "@/server/common/http";
import type { SourceCtx } from "@/server/common/source";
import { githubClient } from "@/server/github/github";
import { resolveRepo } from "@/server/github/external-repos";

export interface GithubReadmeData {
  owner: string;
  repo: string;
  defaultBranch: string;
  repoUrl: string;
  readme: string | null;
}

interface RepoReadmeQueryData {
  repository?: {
    url: string;
    defaultBranchRef?: { name?: string } | null;
    readmeMd?: { text?: string } | null;
    readmeMdx?: { text?: string } | null;
    readmeLower?: { text?: string } | null;
    readmePlain?: { text?: string } | null;
  } | null;
}

const REPO_README_QUERY = `
  query RepoReadme($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      url
      defaultBranchRef { name }
      readmeMd:    object(expression: "HEAD:README.md")  { ... on Blob { text } }
      readmeMdx:   object(expression: "HEAD:README.mdx") { ... on Blob { text } }
      readmeLower: object(expression: "HEAD:readme.md")  { ... on Blob { text } }
      readmePlain: object(expression: "HEAD:README")     { ... on Blob { text } }
    }
  }
`;

export async function getRepoReadmeData(
  env: RuntimeEnv,
  ctx: SourceCtx,
  repo: string,
): Promise<ServiceResult<GithubReadmeData>> {
  const { owner, name } = resolveRepo(repo, env.PUBLIC_GITHUB_USERNAME);

  const client = githubClient(env, ctx);
  const result = await client.gql<RepoReadmeQueryData>(REPO_README_QUERY, {
    variables: { owner, name },
    ttl: 1800,
    timeoutMs: 10_000,
    label: "GitHub README",
  });

  if (!result.ok) return result;

  // GitHub reports a missing repo as an errors[] entry (NOT_FOUND from gql);
  // a bare null is the same answer.
  const repository = result.data.repository;
  if (!repository) {
    return fail({
      code: "NOT_FOUND",
      message: `GitHub repository ${owner}/${name} not found`,
      retryable: false,
    });
  }

  const readme =
    repository.readmeMd?.text ??
    repository.readmeMdx?.text ??
    repository.readmeLower?.text ??
    repository.readmePlain?.text ??
    null;

  return ok({
    owner,
    repo: name,
    defaultBranch: repository.defaultBranchRef?.name ?? "main",
    repoUrl: repository.url,
    readme,
  });
}
