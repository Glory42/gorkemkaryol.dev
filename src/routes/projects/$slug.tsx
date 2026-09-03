import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { PageShell } from "@/components/layout/PageShell";
import { PAGE_MAIN, pageHead, TerminalPrompt } from "@/components/layout/page";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StatusPage } from "@/components/ui/StatusPage";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ReadmeArticle } from "@/features/projects/components/ReadmeArticle";
import {
  getProjectReadme,
  type ProjectReadme,
} from "@/features/projects/projects";
import type { ServiceResult } from "@/server/common/http";
import { runSource } from "@/server/common/page-data";

const getProjectReadmeServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => {
    if (!/^[a-zA-Z0-9_.-]+$/.test(data)) throw new Error("Invalid slug");
    return data;
  })
  .handler(async ({ data: slug }) =>
    runSource((env, ctx) => getProjectReadme(env, ctx, slug)),
  );

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) =>
    pageHead(params.slug, `README for ${params.slug}.`),
  loader: async ({ params }) => {
    const result = await getProjectReadmeServerFn({ data: params.slug });
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
    <PageShell mainClassName={PAGE_MAIN}>
      <div className="mx-auto min-w-0 max-w-[860px] overflow-x-clip">
        <TerminalPrompt cmd={`cat ./projects/${slug}`} className="mb-4" />

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
          <SkeletonBlock className="h-2.5 w-full rounded" />
          <SkeletonBlock className="h-2.5 w-[92%] rounded" />
          <SkeletonBlock className="h-2.5 w-[75%] rounded" />
          <SkeletonBlock className="mt-4 h-2.5 w-full rounded" />
          <SkeletonBlock className="h-2.5 w-[88%] rounded" />
          <SkeletonBlock className="h-2.5 w-[60%] rounded" />
        </div>
      </div>
    </PageShell>
  );
}

function ProjectReadmePage() {
  // A validated createServerFn widens its result; the loader's notFound() throw
  // is what actually gates null, so the cast just recovers the real shape.
  const result = Route.useLoaderData() as ServiceResult<ProjectReadme | null>;

  if (!result.ok) {
    return (
      <PageShell mainClassName={PAGE_MAIN}>
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

  if (!result.data) return null;
  const { kind, title, url, html, hadError } = result.data;

  return (
    <PageShell mainClassName={PAGE_MAIN}>
      <div className="mx-auto min-w-0 max-w-[860px] overflow-x-clip">
        <TerminalPrompt cmd={`cat ./projects/${title}`} className="mb-4" />

        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
          >
            <ChevronLeft size={11} />
            back to projects
          </Link>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
            aria-label={
              kind === "manual" ? `Visit ${title}` : `Open ${title} on GitHub`
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
