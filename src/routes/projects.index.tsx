import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { PageShell } from "@/components/layout/PageShell";
import { ContributionGrid } from "@/components/ui/ContributionGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { ProjectsGrid } from "@/components/ui/ProjectsGrid";
import { readRuntimeEnv } from "@/lib/env";
import { getGithubProjects } from "@/server/github";
import { publicResult } from "@/server/http";

const getGithubProjectsServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return publicResult(await getGithubProjects(runtimeEnv));
  },
);

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects | Gorkem Karyol" },
      {
        name: "description",
        content: "Featured repositories and contribution activity.",
      },
    ],
  }),
  loader: async () => getGithubProjectsServerFn(),
  pendingMs: 0,
  pendingComponent: ProjectsPageSkeleton,
  component: ProjectsPage,
});

function SectionHeader({ sig }: { sig: string; label?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
        {sig}
      </span>
      <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}

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

        <section>
          <SectionHeader sig="/featured" label="Projects" />
          <div className="flex animate-pulse flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
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
        </div>
      </section>
    </PageShell>
  );
}

function ProjectsPage() {
  const result = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <section>
        {!result.ok ? (
          <>
            <p className="mono mb-6 text-[11px] text-[#252525]">~$ ls -la ./projects</p>
            <ErrorPanel title="GitHub API Unavailable" error={result.error} />
          </>
        ) : (
          <div className="mx-auto max-w-[900px]">
            <p className="mono mb-6 text-[11px] text-[#252525]">~$ ls -la ./projects</p>
            <section className="mb-8">
              <ContributionGrid
                username={result.data.username}
                calendar={result.data.contributions}
              />
            </section>

            <div className="mb-8 h-px bg-[rgba(255,255,255,0.05)]" />

            <section>
              <SectionHeader sig="./projects/featured" />

              {result.data.projects.length === 0 ? (
                <EmptyState
                  title="No featured repositories"
                  description="Tag a repository with the 'featured' topic on GitHub to display it here."
                />
              ) : (
                <ProjectsGrid repos={result.data.projects} />
              )}
            </section>
          </div>
        )}
      </section>
    </PageShell>
  );
}
