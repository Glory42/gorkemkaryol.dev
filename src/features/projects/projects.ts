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
  type GithubContributionCalendar,
  type GithubProject,
} from "@/server/github/github";
import { getRepoReadmeData } from "@/server/github/repo-readme";
import { renderMarkdownToHTML } from "@/server/markdown/markdown";
import {
  findManualProject,
  manualProjects,
} from "@/features/projects/manual-projects";

// The projects page composes local manual entries (infallible) with the GitHub
// feed (fallible), so it degrades rather than fails: manual cards always show,
// and a GitHub outage surfaces as `githubError` beside them.
export interface ProjectsView {
  username: string | null;
  featured: GithubProject[];
  contributed: GithubProject[];
  contributions: GithubContributionCalendar | null;
  githubError: ServiceError | null;
}

export async function getProjects(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<ProjectsView>> {
  const manualCards = manualProjects.map((project) => project.card);
  const github = publicResult(await getGithubProjects(env, ctx));

  if (!github.ok) {
    return ok({
      username: null,
      featured: [],
      contributed: manualCards,
      contributions: null,
      githubError: github.error,
    });
  }

  return ok({
    username: github.data.username,
    featured: github.data.featured,
    contributed: [...manualCards, ...github.data.contributed],
    contributions: github.data.contributions,
    githubError: null,
  });
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
    const { html, hadError } = renderMarkdownToHTML(manual.readme);
    return ok({
      kind: "manual",
      title: manual.card.name,
      url: manual.liveUrl,
      html,
      hadError,
    });
  }

  const result = await getRepoReadmeData(env, ctx, slug);
  if (!result.ok) return fail(result.error);
  if (result.data === null || result.data.readme === null) {
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
