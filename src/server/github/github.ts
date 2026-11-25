import type { RuntimeEnv } from "@/lib/env";
import { fail, ok, type ServiceResult } from "@/server/common/http";
import { defineSource, type SourceCtx } from "@/server/common/source";
import { EXTERNAL_REPOS } from "@/server/github/external-repos";

// GitHub GraphQL client for one user; the guard fails calls when token or username is missing.
export const githubClient = defineSource({
  envKeys: ["GITHUB_TOKEN", "PUBLIC_GITHUB_USERNAME"],
  scope: (e) => `github:${e.PUBLIC_GITHUB_USERNAME}`,
  base: () => GITHUB_GRAPHQL_API,
  defaultTtl: 600,
  timeoutMs: 12_000,
  retries: 1,
  headers: (e) => ({
    Authorization: `Bearer ${e.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "gorkemkaryol.dev",
    "X-GitHub-Api-Version": "2022-11-28",
  }),
});

// Each GitHub topic that pulls your own repos into a list: featured → /projects, showcase → home.
export const TOPIC_LISTS = ["featured", "showcase"] as const;
export type TopicList = (typeof TOPIC_LISTS)[number];

/** List topics only steer placement, so they're never rendered as tags. */
export const META_TOPICS: readonly string[] = TOPIC_LISTS;

export interface GithubProject {
  name: string;
  description: string;
  url: string;
  /** The repo's "Website" field, for a live link. */
  homepageUrl?: string | null;
  stargazerCount: number;
  topics: string[];
  primaryLanguage?: {
    name: string;
    color?: string | null;
  } | null;
  updatedAt: string;
  /** Last code push; unlike updatedAt, topic or description edits don't move it. */
  pushedAt?: string;
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

// One newest-push-first list per TOPIC_LISTS entry (`featured`, `showcase`), plus the overview.
export type GithubProjectsPayload = Record<TopicList, GithubProject[]> & {
  username: string;
  /** Repos you don't own (from `EXTERNAL_REPOS`). */
  contributed: GithubProject[];
  contributions: GithubContributionCalendar | null;
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: string;
    cost: number;
  } | null;
};

interface RepositoryNode {
  name?: string;
  description?: string | null;
  url?: string;
  homepageUrl?: string | null;
  stargazerCount?: number;
  updatedAt?: string;
  pushedAt?: string;
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
  user?: {
    contributionsCollection?: {
      contributionCalendar?: {
        totalContributions?: number;
        weeks?: Array<{
          contributionDays?: Array<{
            date: string;
            contributionCount: number;
            contributionLevel:
              "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
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
  [key: string]: unknown; // Aliases: list_featured, list_showcase, repo0, repo1, …
}

type SearchResult = { nodes?: Array<RepositoryNode> } | undefined;

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

const REPO_FRAGMENT = `
  name
  description
  url
  homepageUrl
  stargazerCount
  updatedAt
  pushedAt
  isFork
  repositoryTopics(first: 8) {
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

const listVar = (list: TopicList) => `${list}Query`;

function buildGithubOverviewQuery() {
  const listVars = TOPIC_LISTS.map((list) => `$${listVar(list)}: String!`).join("\n    ");
  const listSearches = TOPIC_LISTS.map(
    (list) => `
    list_${list}: search(query: $${listVar(list)}, type: REPOSITORY, first: 12) {
      nodes {
        ... on Repository {
          ${REPO_FRAGMENT}
        }
      }
    }
    `,
  ).join("");

  const externalRepoAliases = EXTERNAL_REPOS.map(
    ({ owner, name }, i) => `
    repo${i}: repository(owner: "${owner}", name: "${name}") {
      ${REPO_FRAGMENT}
    }
    `,
  ).join("");

  return `
  query GithubOverview(
    $username: String!
    ${listVars}
    $from: DateTime!
    $to: DateTime!
  ) {
    ${listSearches}
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

const lastPush = (p: GithubProject): number => new Date(p.pushedAt || p.updatedAt).getTime();

// Filter out forks and incomplete nodes, map to GithubProject, newest code push first.
function toProjects(nodes: Array<RepositoryNode | undefined>): GithubProject[] {
  return nodes
    .filter((node): node is RepositoryNode => Boolean(node?.name && node?.url) && !node?.isFork)
    .map((node) => ({
      name: node.name ?? "unknown",
      description: node.description ?? "No description provided.",
      url: node.url ?? "",
      homepageUrl: node.homepageUrl || null,
      stargazerCount: node.stargazerCount ?? 0,
      updatedAt: node.updatedAt ?? "",
      pushedAt: node.pushedAt ?? undefined,
      topics:
        node.repositoryTopics?.nodes
          ?.map((topicNode) => topicNode.topic?.name)
          .filter((topic): topic is string => Boolean(topic)) ?? [],
      primaryLanguage:
        node.primaryLanguage?.name != null
          ? { name: node.primaryLanguage.name, color: node.primaryLanguage.color }
          : null,
    }))
    .sort((a, b) => lastPush(b) - lastPush(a));
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

  if (Number.isNaN(limit) || Number.isNaN(remaining) || Number.isNaN(resetEpoch)) {
    return null;
  }

  return {
    limit,
    remaining,
    resetAt: new Date(resetEpoch * 1000).toISOString(),
    cost: 0,
  };
}

function buildRepoQuery(username: string, topic: string): string {
  return `user:${username} topic:${topic} sort:updated-desc`;
}

// Home's showcase strip only needs this one list. The overview query also pays
// for the contribution calendar and every other repo, which makes a cold cache
// slow, so this lighter call fills the strip in about a second.
const SHOWCASE_QUERY = `
  query HomeShowcase($query: String!) {
    list_showcase: search(query: $query, type: REPOSITORY, first: 12) {
      nodes {
        ... on Repository {
          ${REPO_FRAGMENT}
        }
      }
    }
  }
`;

export async function getGithubShowcase(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<GithubProject[]>> {
  const result = await githubClient(env, ctx).gql<{
    list_showcase?: SearchResult;
  }>(SHOWCASE_QUERY, {
    variables: { query: buildRepoQuery(env.PUBLIC_GITHUB_USERNAME, "showcase") },
    label: "GitHub",
  });

  if (!result.ok) return result;
  return ok(toProjects(result.data.list_showcase?.nodes ?? []));
}

export async function getGithubProjects(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<GithubProjectsPayload>> {
  const username = env.PUBLIC_GITHUB_USERNAME;

  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  let responseHeaders: Headers | null = null;

  const client = githubClient(env, ctx);
  const result = await client.gql<GithubOverviewQueryData>(buildGithubOverviewQuery(), {
    variables: {
      username,
      ...Object.fromEntries(
        TOPIC_LISTS.map((list) => [listVar(list), buildRepoQuery(username, list)]),
      ),
      from: from.toISOString(),
      to: to.toISOString(),
    },
    // `from` / `to` change every call, so key on stable inputs (EXTERNAL_REPOS included).
    cacheDiscriminant: `overview:v4:${username}:${EXTERNAL_REPOS.map(
      (repo) => `${repo.owner}/${repo.name}`,
    ).join(",")}`,
    label: "GitHub",
    onMeta: ({ headers }) => {
      responseHeaders = headers;
    },
  });

  if (!result.ok) return result;

  const queryData = result.data;

  const externalNodes = EXTERNAL_REPOS.map(
    (_, i) => queryData[`repo${i}`] as RepositoryNode | undefined,
  ).filter((node): node is RepositoryNode => Boolean(node));

  const lists = Object.fromEntries(
    TOPIC_LISTS.map((list) => [
      list,
      toProjects((queryData[`list_${list}`] as SearchResult)?.nodes ?? []),
    ]),
  ) as Record<TopicList, GithubProject[]>;
  const contributed = toProjects(externalNodes);

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
            queryData.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0,
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
    username,
    ...lists,
    contributed,
    contributions,
    rateLimit,
  });
}
