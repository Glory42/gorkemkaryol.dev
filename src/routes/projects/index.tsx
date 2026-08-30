import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/layout/PageShell";
import { ContributionGrid } from "@/features/projects/components/ContributionGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { ProjectsGrid } from "@/features/projects/components/ProjectsGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { manualProjects } from "@/features/projects/manual-projects";
import { getGithubProjects } from "@/server/github/github";
import { loadSource } from "@/server/common/page-data";

const getGithubProjectsServerFn = createServerFn({ method: "GET" }).handler(() =>
  loadSource(getGithubProjects),
);

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects | Gorkem Karyol" },
      {
        name: "description",
        content: "Featured and contributed projects, plus contribution activity.",
      },
    ],
  }),
  loader: async () => getGithubProjectsServerFn(),
  pendingMs: 0,
  pendingComponent: ProjectsPageSkeleton,
  component: ProjectsPage,
});

function ProjectsPageSkeleton() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <section>
        <div className="mx-auto max-w-[900px]">
        <p className="mono mb-6 text-[11px] text-[#252525]">~$ ls -la ./projects</p>
        <section className="mb-8 animate-pulse">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2 w-32 rounded bg-[rgba(255,255,255,0.04)]" />
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
              <div className="h-3 w-32 rounded bg-[rgba(255,255,255,0.04)]" />
              <div className="h-2 w-48 rounded bg-[rgba(255,255,255,0.03)]" />
              <div className="flex gap-2">
                <div className="h-4 w-14 rounded bg-[rgba(255,255,255,0.04)]" />
                <div className="h-4 w-14 rounded bg-[rgba(255,255,255,0.04)]" />
              </div>
            </div>
            <div className="h-2 w-8 shrink-0 rounded bg-[rgba(255,255,255,0.04)]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsPage() {
  const result = Route.useLoaderData();

  const featured = result.ok ? result.data.featured : [];
  // Manual entries lead the contributed column; they render even when the
  // GitHub fetch fails, so an outage can't hide them.
  const contributed = [
    ...manualProjects.map((p) => p.card),
    ...(result.ok ? result.data.contributed : []),
  ];

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <section>
        <div className="mx-auto max-w-[900px]">
          <p className="mono mb-6 text-[11px] text-[#252525]">~$ ls -la ./projects</p>

          {result.ok ? (
            <section className="mb-8">
              <ContributionGrid
                username={result.data.username}
                calendar={result.data.contributions}
              />
            </section>
          ) : (
            <div className="mb-8">
              <ErrorPanel title="GitHub API Unavailable" error={result.error} />
            </div>
          )}

          <div className="mb-8 h-px bg-[rgba(255,255,255,0.05)]" />

          <div className="flex flex-col gap-8 lg:flex-row">
            <section className="min-w-0 flex-1">
              <SectionHeader sig="./projects/featured" />
              {featured.length === 0 ? (
                <EmptyState
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
                <EmptyState
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
