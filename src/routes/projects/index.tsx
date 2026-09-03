import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/layout/PageShell";
import { PAGE_MAIN, pageHead, TerminalPrompt } from "@/components/layout/page";
import { ContributionGrid } from "@/features/projects/components/ContributionGrid";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/Skeleton";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ProjectsGrid } from "@/features/projects/components/ProjectsGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProjects } from "@/features/projects/projects";
import { runSource } from "@/server/common/page-data";

const getProjectsServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getProjects),
);

export const Route = createFileRoute("/projects/")({
  head: () =>
    pageHead(
      "Projects",
      "Featured and contributed projects, plus contribution activity.",
    ),
  loader: async () => getProjectsServerFn(),
  pendingMs: 0,
  pendingComponent: ProjectsPageSkeleton,
  component: ProjectsPage,
});

function ProjectsPageSkeleton() {
  return (
    <PageShell mainClassName={PAGE_MAIN}>
      <section>
        <div className="mx-auto max-w-[900px]">
        <TerminalPrompt cmd="ls -la ./projects" className="mb-6" />
        <section className="mb-8 animate-pulse">
          <div className="mb-4 flex items-center gap-3">
            <SkeletonLine className="h-2 w-32" />
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
          </div>
          <div className="overflow-x-auto">
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))", minWidth: `${52 * 13}px`, gap: "3px" }}
          >
            {Array.from({ length: 52 }).map((_, w) => (
              <div key={w} className="grid grid-rows-7" style={{ gap: "3px" }}>
                {Array.from({ length: 7 }).map((_, d) => (
                  <div
                    key={d}
                    className="aspect-square w-full rounded-[2px]"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  />
                ))}
              </div>
            ))}
          </div>
          </div>
        </section>

        <div className="mb-8 h-px bg-[rgba(255,255,255,0.05)]" />

        <div className="flex flex-col gap-8 lg:flex-row">
          <SkeletonColumn sig="/featured" rows={3} />
          <div className="hidden w-px shrink-0 self-stretch bg-[rgba(255,255,255,0.05)] lg:block" />
          <SkeletonColumn sig="/contributed" rows={3} />
        </div>
        </div>
      </section>
    </PageShell>
  );
}

function SkeletonColumn({ sig, rows }: { sig: string; rows: number }) {
  return (
    <section className="min-w-0 flex-1">
      <SectionHeader sig={sig} />
      <div className="flex animate-pulse flex-col">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-5 border-b border-[rgba(255,255,255,0.04)] py-5"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-3 w-32" />
              <SkeletonBlock className="h-2 w-48 rounded" />
              <div className="flex gap-2">
                <SkeletonLine className="h-4 w-14" />
                <SkeletonLine className="h-4 w-14" />
              </div>
            </div>
            <SkeletonLine className="h-2 w-8 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsPage() {
  const result = Route.useLoaderData();

  // getProjects degrades rather than fails; this guards the type, not a real path.
  if (!result.ok) {
    return (
      <PageShell mainClassName={PAGE_MAIN}>
        <section>
          <div className="mx-auto max-w-[900px]">
            <TerminalPrompt cmd="ls -la ./projects" className="mb-6" />
            <StatusPanel tone="error" title="Projects Unavailable" error={result.error} />
          </div>
        </section>
      </PageShell>
    );
  }

  const { username, featured, contributed, contributions, githubError } =
    result.data;

  return (
    <PageShell mainClassName={PAGE_MAIN}>
      <section>
        <div className="mx-auto max-w-[900px]">
          <TerminalPrompt cmd="ls -la ./projects" className="mb-6" />

          {githubError ? (
            <div className="mb-8">
              <StatusPanel tone="error" title="GitHub API Unavailable" error={githubError} />
            </div>
          ) : (
            <section className="mb-8">
              <ContributionGrid
                username={username ?? ""}
                calendar={contributions}
              />
            </section>
          )}

          <div className="mb-8 h-px bg-[rgba(255,255,255,0.05)]" />

          <div className="flex flex-col gap-8 lg:flex-row">
            <section className="min-w-0 flex-1">
              <SectionHeader sig="./projects/featured" />
              {featured.length === 0 ? (
                <StatusPanel
                  tone="empty"
                  title="No featured repositories"
                  description="Tag a repository with the 'featured' topic on GitHub to display it here."
                />
              ) : (
                <ProjectsGrid repos={featured} />
              )}
            </section>

            <div className="hidden w-px shrink-0 self-stretch bg-[rgba(255,255,255,0.05)] lg:block" />

            <section className="min-w-0 flex-1">
              <SectionHeader sig="./projects/contributed" />
              {contributed.length === 0 ? (
                <StatusPanel
                  tone="empty"
                  title="Nothing here yet"
                  description="External and company projects show up here."
                />
              ) : (
                <ProjectsGrid repos={contributed} />
              )}
            </section>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
