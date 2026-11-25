import type { RuntimeEnv } from "@/lib/env";
import {
  fail,
  ok,
  publicResult,
  type ServiceError,
  type ServiceResult,
} from "@/server/common/http";
import type { SourceCtx } from "@/server/common/source";
import {
  getGithubProjects,
  getGithubShowcase,
  META_TOPICS,
  type GithubContributionCalendar,
  type GithubProject,
} from "@/server/github/github";
import { getRepoReadmeData } from "@/server/github/repo-readme";
import { renderMarkdownToHTML } from "@/server/markdown/markdown";
import { PROJECT_IMAGE_SIZES } from "@/features/projects/content/image-sizes";
import {
  findManualProject,
  manualProjects,
  type ManualProject,
} from "@/features/projects/manual-projects";

/** Everything a project card renders, whether it came from GitHub or was written by hand. */
export interface ProjectCard {
  /** Display name and the `/projects/$slug` key. */
  name: string;
  kind: "github" | "manual";
  description: string;
  live: string | null;
  code: string | null;
  language: string | null;
  /** Topics minus list topics and case-insensitive repeats, including one of the language. */
  tags: string[];
  stars: number;
}

// Manual cards always show; a GitHub outage degrades to `githubError` beside them.
export interface ProjectsView {
  username: string | null;
  featured: ProjectCard[];
  showcase: ProjectCard[];
  contributed: ProjectCard[];
  contributions: GithubContributionCalendar | null;
  githubError: ServiceError | null;
  /** Every project with a page, for the sitemap and the palette. */
  slugs: string[];
}

function tagsFor(topics: string[], language: string | null): string[] {
  const seen = new Set(language ? [language.toLowerCase()] : []);
  return topics.filter((topic) => {
    const key = topic.toLowerCase();
    if (META_TOPICS.includes(topic) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function githubCard(repo: GithubProject): ProjectCard {
  const language = repo.primaryLanguage?.name ?? null;
  return {
    name: repo.name,
    kind: "github",
    description: repo.description,
    live: repo.homepageUrl || null,
    code: repo.url,
    language,
    tags: tagsFor(repo.topics, language),
    stars: repo.stargazerCount,
  };
}

function manualCard(project: ManualProject): ProjectCard {
  return {
    name: project.name,
    kind: "manual",
    description: project.description,
    live: project.live,
    code: null,
    language: project.language,
    tags: tagsFor(project.tags, project.language),
    stars: 0,
  };
}

function view(
  lists: Pick<ProjectsView, "username" | "featured" | "showcase" | "contributed" | "contributions" | "githubError">,
): ProjectsView {
  const all = [...lists.featured, ...lists.showcase, ...lists.contributed];
  return { ...lists, slugs: [...new Set(all.map((card) => card.name))] };
}

export async function getProjects(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<ProjectsView>> {
  const manualCards = manualProjects.map(manualCard);
  const github = publicResult(await getGithubProjects(env, ctx));

  if (!github.ok) {
    return ok(
      view({
        username: null,
        featured: [],
        showcase: [],
        contributed: manualCards,
        contributions: null,
        githubError: github.error,
      }),
    );
  }

  return ok(
    view({
      username: github.data.username,
      featured: github.data.featured.map(githubCard),
      showcase: github.data.showcase.map(githubCard),
      contributed: [...manualCards, ...github.data.contributed.map(githubCard)],
      contributions: github.data.contributions,
      githubError: null,
    }),
  );
}

// The home strip only needs the showcase list; skipping the overview query's
// calendar and other lists keeps a cold first paint fast.
export async function getShowcaseProjects(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<ProjectCard[]>> {
  const result = await getGithubShowcase(env, ctx);
  return result.ok ? ok(result.data.map(githubCard)) : result;
}

export interface ProjectReadme {
  kind: "github" | "manual";
  title: string;
  /** GitHub repo URL, or the live product URL for a manual project. */
  url: string;
  html: string;
  hadError: boolean;
}

export async function getProjectReadme(
  env: RuntimeEnv,
  ctx: SourceCtx,
  slug: string,
): Promise<ServiceResult<ProjectReadme>> {
  const manual = findManualProject(slug);
  if (manual) {
    const { html, hadError } = renderMarkdownToHTML(manual.readme, {
      imageSize: (src) => PROJECT_IMAGE_SIZES[src],
    });
    return ok({
      kind: "manual",
      title: manual.name,
      url: manual.live,
      html,
      hadError,
    });
  }

  const result = await getRepoReadmeData(env, ctx, slug);
  if (!result.ok) return result;
  if (result.data.readme === null) {
    return fail({
      code: "NOT_FOUND",
      message: `No project or README found for "${slug}"`,
      retryable: false,
    });
  }

  const { html, hadError } = renderMarkdownToHTML(result.data.readme, {
    owner: result.data.owner,
    repo: result.data.repo,
    branch: result.data.defaultBranch,
    repoUrl: result.data.repoUrl,
  });

  return ok({
    kind: "github",
    title: result.data.repo,
    url: result.data.repoUrl,
    html,
    hadError,
  });
}
