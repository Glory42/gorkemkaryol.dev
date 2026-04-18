import { requireGithubEnv, type RuntimeEnv } from "@/lib/env";
import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/http";

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

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

interface GithubOverviewQueryData {
  search?: {
    nodes?: Array<{
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
    }>;
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
}

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

const GITHUB_OVERVIEW_QUERY = `
  query GithubOverview(
    $username: String!
    $repoQuery: String!
    $from: DateTime!
    $to: DateTime!
  ) {
    search(query: $repoQuery, type: REPOSITORY, first: 12) {
      nodes {
        ... on Repository {
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
        }
      }
    }
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
): Promise<GithubReadmeData | null> {
  const envResult = requireGithubEnv(runtimeEnv);
  if (!envResult.ok) return null;

  const { PUBLIC_GITHUB_USERNAME, GITHUB_TOKEN } = envResult.data;

  const result = await requestJsonWithRetry<
    GraphQLResponse<RepoReadmeQueryData>
  >({
    url: GITHUB_GRAPHQL_API,
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gorkemkaryol.dev",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: {
      query: REPO_README_QUERY,
      variables: { owner: PUBLIC_GITHUB_USERNAME, name: repo },
    },
    timeoutMs: 10_000,
    retries: 1,
  });

  if (!result.ok) return null;

  const repository = result.data.data?.data?.repository;
  if (!repository) return null;

  const readme =
    repository.readmeMd?.text ??
    repository.readmeMdx?.text ??
    repository.readmeLower?.text ??
    repository.readmePlain?.text ??
    null;

  return {
    owner: PUBLIC_GITHUB_USERNAME,
    repo,
    defaultBranch: repository.defaultBranchRef?.name ?? "main",
    repoUrl: repository.url,
    readme,
  };
}

export async function getGithubProjects(
  runtimeEnv: RuntimeEnv,
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

  const requestResult = await requestJsonWithRetry<
    GraphQLResponse<GithubOverviewQueryData>
  >({
    url: GITHUB_GRAPHQL_API,
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gorkemkaryol.dev",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: {
      query: GITHUB_OVERVIEW_QUERY,
      variables: {
        username: PUBLIC_GITHUB_USERNAME,
        repoQuery: buildRepoQuery(PUBLIC_GITHUB_USERNAME),
        from: from.toISOString(),
        to: to.toISOString(),
      },
    },
    timeoutMs: 12_000,
    retries: 1,
  });

  if (!requestResult.ok) {
    return requestResult;
  }

  const graphQLPayload = requestResult.data.data;
  const graphQLErrors = graphQLPayload.errors ?? [];
  const hasRateLimitError = graphQLErrors.some((error) =>
    error.message.toLowerCase().includes("rate limit"),
  );

  if (graphQLErrors.length > 0) {
    return fail({
      code: hasRateLimitError ? "RATE_LIMITED" : "UPSTREAM_ERROR",
      message: "GitHub GraphQL query failed",
      retryable: hasRateLimitError,
      details: graphQLErrors.map((error) => error.message).join(" | "),
    });
  }

  const queryData = graphQLPayload.data;

  if (!queryData) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: "GitHub response did not include data",
      retryable: true,
    });
  }

  const projectNodes = queryData.search?.nodes ?? [];
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
    }));

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
    : mapRateLimitFromHeaders(requestResult.data.headers);

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
