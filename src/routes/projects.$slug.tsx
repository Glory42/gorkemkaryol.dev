import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { PageShell } from "@/components/layout/PageShell";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { ReadmeArticle } from "@/components/ui/ReadmeArticle";
import { readRuntimeEnv } from "@/lib/env";
import { findManualProject } from "@/lib/manual-projects";
import { getRepoReadmeData } from "@/server/github";
import { renderMarkdownToHTML } from "@/server/markdown";
import { ok, publicResult, type ServiceResult } from "@/server/http";

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

    const runtimeEnv = readRuntimeEnv(workerEnv);
    const result = publicResult(await getRepoReadmeData(slug, runtimeEnv));

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
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto max-w-[860px]">
        <p className="mono text-[11px] text-[#333]">404 — project not found</p>
        <div className="mt-4">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#444] no-underline transition-colors hover:text-white"
          >
            <ChevronLeft size={11} />
            back to projects
          </Link>
        </div>
      </div>
    </PageShell>
  ),
  component: ProjectReadmePage,
});

function ProjectReadmeSkeleton() {
  const { slug } = Route.useParams();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto min-w-0 max-w-[860px] overflow-hidden">
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
        <div className="mx-auto min-w-0 max-w-[860px] overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/projects"
              className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
            >
              <ChevronLeft size={11} />
              back to projects
            </Link>
          </div>
          <ErrorPanel title="GitHub API Unavailable" error={result.error} />
        </div>
      </PageShell>
    );
  }

  const { repo, repoUrl, html, hadError, kind } = result.data as ReadmePageData;

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto min-w-0 max-w-[860px] overflow-hidden">
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
