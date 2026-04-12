import { postJson } from "@/lib/server/http";
import {
  getGithubToken,
  getGithubUsername,
  type RuntimeEnvInput,
} from "@/lib/utils/env";
import type {
  ContributionCalendar,
  FeaturedRepository,
  RepoReadmeData,
} from "@/types/github";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

interface ProjectsOverviewData {
  search?: {
    nodes?: Array<{
      name?: string;
      description?: string | null;
      url?: string;
      stargazerCount?: number;
      updatedAt?: string;
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
}

interface RepoReadmeQueryData {
  repository?: {
    url: string;
    defaultBranchRef?: {
      name?: string;
    } | null;
    readmeMd?: { text?: string } | null;
    readmeMdx?: { text?: string } | null;
    readmeLower?: { text?: string } | null;
    readmePlain?: { text?: string } | null;
  } | null;
}

function buildAuthHeaders(runtimeEnv: RuntimeEnvInput) {
  const token = getGithubToken(runtimeEnv);
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

function mapContributionLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  if (level === "FOURTH_QUARTILE") return 4;
  if (level === "THIRD_QUARTILE") return 3;
  if (level === "SECOND_QUARTILE") return 2;
  if (level === "FIRST_QUARTILE") return 1;
  return 0;
}

export async function getProjectsOverview(
  runtimeEnv: RuntimeEnvInput,
): Promise<{
  username: string;
  repos: FeaturedRepository[];
  contributions: ContributionCalendar | null;
}> {
  const username = getGithubUsername(runtimeEnv);
  const headers = buildAuthHeaders(runtimeEnv);

  if (!username || !headers) {
    return { username, repos: [], contributions: null };
  }

  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);

  const query = `
    query ProjectsOverview($repoQuery: String!, $login: String!, $from: DateTime!, $to: DateTime!) {
      search(query: $repoQuery, type: REPOSITORY, first: 10) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            updatedAt
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
      user(login: $login) {
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
    }
  `;

  try {
    const response = await postJson<GraphQLResponse<ProjectsOverviewData>>(
      GITHUB_GRAPHQL_API,
      {
        query,
        variables: {
          repoQuery: `user:${username} topic:featured sort:updated-desc`,
          login: username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      },
      headers,
    );

    if (response.errors?.length) {
      console.error(
        "GitHub GraphQL errors:",
        response.errors.map((e) => e.message),
      );
      return { username, repos: [], contributions: null };
    }

    const repos: FeaturedRepository[] =
      response.data?.search?.nodes
        ?.filter((node) => Boolean(node?.name && node?.url))
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
        })) ?? [];

    const contributionDays =
      response.data?.user?.contributionsCollection?.contributionCalendar?.weeks
        ?.flatMap((week) => week.contributionDays ?? [])
        .map((day) => ({
          date: day.date,
          count: day.contributionCount,
          level: mapContributionLevel(day.contributionLevel),
        })) ?? [];

    const contributions: ContributionCalendar | null =
      contributionDays.length > 0
        ? {
            totalContributions:
              response.data?.user?.contributionsCollection?.contributionCalendar
                ?.totalContributions ?? 0,
            days: contributionDays,
          }
        : null;

    return { username, repos, contributions };
  } catch (error) {
    console.error("Failed to fetch GitHub project overview:", error);
    return { username, repos: [], contributions: null };
  }
}

export async function getRepoReadmeData(
  repo: string,
  runtimeEnv: RuntimeEnvInput,
): Promise<RepoReadmeData | null> {
  const owner = getGithubUsername(runtimeEnv);
  const headers = buildAuthHeaders(runtimeEnv);

  if (!owner || !headers || !repo) return null;

  const query = `
    query RepoReadme($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        url
        defaultBranchRef {
          name
        }
        readmeMd: object(expression: "HEAD:README.md") {
          ... on Blob {
            text
          }
        }
        readmeMdx: object(expression: "HEAD:README.mdx") {
          ... on Blob {
            text
          }
        }
        readmeLower: object(expression: "HEAD:readme.md") {
          ... on Blob {
            text
          }
        }
        readmePlain: object(expression: "HEAD:README") {
          ... on Blob {
            text
          }
        }
      }
    }
  `;

  try {
    const response = await postJson<GraphQLResponse<RepoReadmeQueryData>>(
      GITHUB_GRAPHQL_API,
      {
        query,
        variables: {
          owner,
          name: repo,
        },
      },
      headers,
    );

    if (response.errors?.length) {
      console.error(
        "GitHub README query errors:",
        response.errors.map((e) => e.message),
      );
      return null;
    }

    const repository = response.data?.repository;
    if (!repository) return null;

    const readme =
      repository.readmeMd?.text ??
      repository.readmeMdx?.text ??
      repository.readmeLower?.text ??
      repository.readmePlain?.text ??
      null;

    return {
      owner,
      repo,
      defaultBranch: repository.defaultBranchRef?.name ?? "main",
      repoUrl: repository.url,
      readme,
    };
  } catch (error) {
    console.error("Failed to fetch repository README:", error);
    return null;
  }
}
