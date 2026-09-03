import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { PageShell } from "@/components/layout/PageShell";
import { StatusPage } from "@/components/ui/StatusPage";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ReadmeArticle } from "@/features/projects/components/ReadmeArticle";
import { findManualProject } from "@/features/projects/manual-projects";
import { getRepoReadmeData } from "@/server/github/github";
import { renderMarkdownToHTML } from "@/server/markdown/markdown";
import { ok, type ServiceResult } from "@/server/common/http";
import { runSource } from "@/server/common/page-data";

interface ReadmePageData {
  repo: string;
  /** GitHub repo URL, or — for a manual project — the live product URL. */
  repoUrl: string;
  html: string;
  hadError: boolean;
  kind: "github" | "manual";
}

const getRepoReadmeServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => {
    if (!/^[a-zA-Z0-9_.-]+$/.test(data)) throw new Error("Invalid slug");
    return data;
  })
  .handler(async ({ data: slug }) => {
    const manual = findManualProject(slug);
    if (manual) {
      const { html, hadError } = renderMarkdownToHTML(
        manual.readme,
        "",
        manual.slug,
        "",
        "",
      );
      return ok({
        repo: manual.card.name,
        repoUrl: manual.liveUrl,
        html,
        hadError,
        kind: "manual" as const,
      });
    }

    const result = await runSource((env, ctx) =>
      getRepoReadmeData(env, ctx, slug),
    );

    if (!result.ok) return result;
    if (result.data === null || result.data.readme === null) {
      return ok(null);
    }

    const { html, hadError } = renderMarkdownToHTML(
      result.data.readme,
      result.data.owner,
      result.data.repo,
      result.data.defaultBranch,
      result.data.repoUrl,
    );

    return ok({
      repo: result.data.repo,
      repoUrl: result.data.repoUrl,
      html,
      hadError,
      kind: "github" as const,
    });
  });

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | Gorkem Karyol` },
      { name: "description", content: `README for ${params.slug}.` },
    ],
  }),
  loader: async ({ params }) => {
    const result = await getRepoReadmeServerFn({ data: params.slug });
    if (result.ok && result.data === null) throw notFound();
    return result;
  },
  pendingMs: 0,
  pendingComponent: ProjectReadmeSkeleton,
  notFoundComponent: () => (
    <StatusPage
      variant="not-found"
      title="Project not found"
      message="No project matches that name."
      backTo="/projects"
      backLabel="back to projects"
    />
  ),
  component: ProjectReadmePage,
});

function ProjectReadmeSkeleton() {
  const { slug } = Route.useParams();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto min-w-0 max-w-[860px] overflow-x-clip">
        <p className="mono mb-4 text-[11px] text-[#252525]">~$ cat ./projects/{slug}</p>

        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
          >
            <ChevronLeft size={11} />
            back to projects
          </Link>
        </div>

        <div className="space-y-3">
          <div className="h-4 w-1/3 rounded bg-[rgba(255,255,255,0.05)]" />
          <div className="h-2.5 w-full rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-2.5 w-[92%] rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-2.5 w-[75%] rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="mt-4 h-2.5 w-full rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-2.5 w-[88%] rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-2.5 w-[60%] rounded bg-[rgba(255,255,255,0.03)]" />
        </div>
      </div>
    </PageShell>
  );
}

function ProjectReadmePage() {
  const result = Route.useLoaderData() as ServiceResult<ReadmePageData | null>;

  if (!result.ok) {
    return (
      <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
        <div className="mx-auto min-w-0 max-w-[860px] overflow-x-clip">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/projects"
              className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
            >
              <ChevronLeft size={11} />
              back to projects
            </Link>
          </div>
          <StatusPanel tone="error" title="GitHub API Unavailable" error={result.error} />
        </div>
      </PageShell>
    );
  }

  const { repo, repoUrl, html, hadError, kind } = result.data as ReadmePageData;

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto min-w-0 max-w-[860px] overflow-x-clip">
        <p className="mono mb-4 text-[11px] text-[#252525]">~$ cat ./projects/{repo}</p>

        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
          >
            <ChevronLeft size={11} />
            back to projects
          </Link>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
            aria-label={
              kind === "manual"
                ? `Visit ${repo}`
                : `Open ${repo} on GitHub`
            }
          >
            {kind === "manual" ? (
              <>
                visit site
                <ExternalLink size={10} />
              </>
            ) : (
              <>
                <GithubIcon size={12} />
                open on github
                <ExternalLink size={10} />
              </>
            )}
          </a>
        </div>

        <ReadmeArticle html={html} hadError={hadError} />
      </div>
    </PageShell>
  );
}
