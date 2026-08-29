import { requireGithubEnv, type RuntimeEnv } from "@/lib/env";
import { fail, ok, type ServiceResult } from "@/server/http";
import { workersRuntime, type RuntimePort } from "@/server/runtime";
import { createUpstreamClient, type UpstreamClient } from "@/server/upstream";
import { EXTERNAL_REPOS } from "@/lib/upstream-config";

/** A client for GitHub's GraphQL API, scoped and authenticated for one user. */
function githubClient(
  username: string,
  token: string,
  runtime?: RuntimePort,
): UpstreamClient {
  return createUpstreamClient({
    base: GITHUB_GRAPHQL_API,
    defaultTtl: 600,
    timeoutMs: 12_000,
    retries: 1,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gorkemkaryol.dev",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cacheScope: `github:${username}`,
    runtime: runtime ?? workersRuntime(),
  });
}

export interface GithubProject {
  name: string;
  description: string;
  url: string;
  stargazerCount: number;
  topics: string[];
  primaryLanguage?: {
    name: string;
    color?: string | null;
  } | null;
  updatedAt: string;
}

export interface GithubContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubContributionCalendar {
  totalContributions: number;
  days: GithubContributionDay[];
}

export interface GithubProjectsPayload {
  username: string;
  projects: GithubProject[];
  contributions: GithubContributionCalendar | null;
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: string;
    cost: number;
  } | null;
}

interface RepositoryNode {
  name?: string;
  description?: string | null;
  url?: string;
  stargazerCount?: number;
  updatedAt?: string;
  isFork?: boolean;
  repositoryTopics?: {
    nodes?: Array<{
      topic?: {
        name?: string;
      } | null;
    }>;
  };
  primaryLanguage?: {
    name?: string;
    color?: string | null;
  } | null;
}

interface GithubOverviewQueryData {
  search?: {
    nodes?: Array<RepositoryNode>;
  };
  user?: {
    contributionsCollection?: {
      contributionCalendar?: {
        totalContributions?: number;
        weeks?: Array<{
          contributionDays?: Array<{
            date: string;
            contributionCount: number;
            contributionLevel:
              | "NONE"
              | "FIRST_QUARTILE"
              | "SECOND_QUARTILE"
              | "THIRD_QUARTILE"
              | "FOURTH_QUARTILE";
          }>;
        }>;
      };
    };
  };
  rateLimit?: {
    limit?: number;
    remaining?: number;
    resetAt?: string;
    cost?: number;
  };
  [key: string]: unknown; // Allow repo0, repo1, etc. aliases
}

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

const REPO_FRAGMENT = `
  name
  description
  url
  stargazerCount
  updatedAt
  isFork
  repositoryTopics(first: 4) {
    nodes {
      topic {
        name
      }
    }
  }
  primaryLanguage {
    name
    color
  }
`;

function buildGithubOverviewQuery() {
  const externalRepoAliases = EXTERNAL_REPOS.map((repo, i) => {
    const [owner, name] = repo.split("/");
    return `
    repo${i}: repository(owner: "${owner}", name: "${name}") {
      ${REPO_FRAGMENT}
    }
    `;
  }).join("");

  return `
  query GithubOverview(
    $username: String!
    $repoQuery: String!
    $from: DateTime!
    $to: DateTime!
  ) {
    search(query: $repoQuery, type: REPOSITORY, first: 12) {
      nodes {
        ... on Repository {
          ${REPO_FRAGMENT}
        }
      }
    }
    ${externalRepoAliases}
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
    rateLimit {
      limit
      remaining
      resetAt
      cost
    }
  }
  `;
}

function mapContributionLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  if (level === "FOURTH_QUARTILE") return 4;
  if (level === "THIRD_QUARTILE") return 3;
  if (level === "SECOND_QUARTILE") return 2;
  if (level === "FIRST_QUARTILE") return 1;
  return 0;
}

function mapRateLimitFromHeaders(headers: Headers): {
  limit: number;
  remaining: number;
  resetAt: string;
  cost: number;
} | null {
  const limit = Number(headers.get("x-ratelimit-limit") ?? "");
  const remaining = Number(headers.get("x-ratelimit-remaining") ?? "");
  const resetEpoch = Number(headers.get("x-ratelimit-reset") ?? "");

  if (
    Number.isNaN(limit) ||
    Number.isNaN(remaining) ||
    Number.isNaN(resetEpoch)
  ) {
    return null;
  }

  return {
    limit,
    remaining,
    resetAt: new Date(resetEpoch * 1000).toISOString(),
    cost: 0,
  };
}

function buildRepoQuery(username: string): string {
  return `user:${username} topic:featured sort:updated-desc`;
}

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
  repo: string,
  runtimeEnv: RuntimeEnv,
  runtime: RuntimePort = workersRuntime(),
): Promise<ServiceResult<GithubReadmeData | null>> {
  const envResult = requireGithubEnv(runtimeEnv);
  if (!envResult.ok) {
    return fail({
      code: "MISSING_ENV",
      message: envResult.error.message,
      retryable: false,
      details: envResult.error.fields.join(", "),
    });
  }

  const { PUBLIC_GITHUB_USERNAME, GITHUB_TOKEN } = envResult.data;

  let owner = PUBLIC_GITHUB_USERNAME;
  const externalMatch = EXTERNAL_REPOS.find((r) => r.endsWith(`/${repo}`));
  if (externalMatch) {
    owner = externalMatch.split("/")[0];
  }

  const client = githubClient(PUBLIC_GITHUB_USERNAME, GITHUB_TOKEN, runtime);
  const result = await client.gql<RepoReadmeQueryData>(REPO_README_QUERY, {
    variables: { owner, name: repo },
    ttl: 1800,
    timeoutMs: 10_000,
    label: "GitHub README",
  });

  if (!result.ok) return result;

  const repository = result.data.repository;
  if (!repository) return ok(null);

  const readme =
    repository.readmeMd?.text ??
    repository.readmeMdx?.text ??
    repository.readmeLower?.text ??
    repository.readmePlain?.text ??
    null;

  return ok({
    owner,
    repo,
    defaultBranch: repository.defaultBranchRef?.name ?? "main",
    repoUrl: repository.url,
    readme,
  });
}

export async function getGithubProjects(
  runtimeEnv: RuntimeEnv,
  runtime: RuntimePort = workersRuntime(),
): Promise<ServiceResult<GithubProjectsPayload>> {
  const envResult = requireGithubEnv(runtimeEnv);

  if (!envResult.ok) {
    return fail({
      code: "MISSING_ENV",
      message: envResult.error.message,
      retryable: false,
      details: envResult.error.fields.join(", "),
    });
  }

  const { PUBLIC_GITHUB_USERNAME, GITHUB_TOKEN } = envResult.data;

  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  let responseHeaders: Headers | null = null;

  const client = githubClient(PUBLIC_GITHUB_USERNAME, GITHUB_TOKEN, runtime);
  const result = await client.gql<GithubOverviewQueryData>(
    buildGithubOverviewQuery(),
    {
      variables: {
        username: PUBLIC_GITHUB_USERNAME,
        repoQuery: buildRepoQuery(PUBLIC_GITHUB_USERNAME),
        from: from.toISOString(),
        to: to.toISOString(),
      },
      // `from` / `to` move every call — key on the stable inputs instead, but
      // include EXTERNAL_REPOS so adding one busts the cache immediately.
      cacheKey: `overview:${PUBLIC_GITHUB_USERNAME}:${EXTERNAL_REPOS.join(",")}`,
      label: "GitHub",
      onMeta: ({ headers }) => {
        responseHeaders = headers;
      },
    },
  );

  if (!result.ok) return result;

  const queryData = result.data;

  const externalNodes = EXTERNAL_REPOS.map(
    (_, i) => queryData[`repo${i}`] as RepositoryNode | undefined,
  ).filter((node): node is RepositoryNode => Boolean(node));

  const projectNodes = [...(queryData.search?.nodes ?? []), ...externalNodes];

  const projects: GithubProject[] = projectNodes
    .filter((node) => Boolean(node?.name && node?.url) && !node?.isFork)
    .map((node) => ({
      name: node.name ?? "unknown",
      description: node.description ?? "No description provided.",
      url: node.url ?? "",
      stargazerCount: node.stargazerCount ?? 0,
      updatedAt: node.updatedAt ?? "",
      topics:
        node.repositoryTopics?.nodes
          ?.map((topicNode) => topicNode.topic?.name)
          .filter((topic): topic is string => Boolean(topic)) ?? [],
      primaryLanguage:
        node.primaryLanguage?.name != null
          ? {
              name: node.primaryLanguage.name,
              color: node.primaryLanguage.color,
            }
          : null,
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const contributionDays =
    queryData.user?.contributionsCollection?.contributionCalendar?.weeks
      ?.flatMap((week) => week.contributionDays ?? [])
      .map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: mapContributionLevel(day.contributionLevel),
      })) ?? [];

  const contributions: GithubContributionCalendar | null =
    contributionDays.length > 0
      ? {
          totalContributions:
            queryData.user?.contributionsCollection?.contributionCalendar
              ?.totalContributions ?? 0,
          days: contributionDays,
        }
      : null;

  const rateLimit = queryData.rateLimit
    ? {
        limit: queryData.rateLimit.limit ?? 0,
        remaining: queryData.rateLimit.remaining ?? 0,
        resetAt: queryData.rateLimit.resetAt ?? "",
        cost: queryData.rateLimit.cost ?? 0,
      }
    : responseHeaders
      ? mapRateLimitFromHeaders(responseHeaders)
      : null;

  if ((rateLimit?.remaining ?? 1) <= 0) {
    return fail({
      code: "RATE_LIMITED",
      message: "GitHub API rate limit exceeded",
      retryable: true,
      details: rateLimit?.resetAt
        ? `Resets at ${rateLimit.resetAt}`
        : "No reset time returned by upstream",
    });
  }

  return ok({
    username: PUBLIC_GITHUB_USERNAME,
    projects,
    contributions,
    rateLimit,
  });
}
