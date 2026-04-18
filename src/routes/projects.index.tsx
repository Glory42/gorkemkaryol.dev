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

const getGithubProjectsServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return getGithubProjects(runtimeEnv);
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

function ProjectsPageSkeleton() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(20px,2.5vh)]">
      <section>
        <header className="mb-10">
          <div className="mb-2">
            <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
              /contributions
            </span>
          </div>
          <h1 className="mono m-0 mb-[6px] text-[clamp(26px,5vw,44px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
            PROJECTS
          </h1>
          <p className="m-0 mt-0 max-w-[480px] text-[13px] leading-[1.65] text-[rgba(144,140,170,0.8)]">
            Live GitHub repositories and contribution activity.
          </p>
        </header>

        <section className="animate-pulse">
          <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.45)] px-5 py-4">
            <div className="h-2.5 w-48 rounded bg-[rgba(64,61,82,0.55)]" />
            <div className="h-2.5 w-24 rounded bg-[rgba(64,61,82,0.55)]" />
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[820px]">
              <div
                className="grid w-full gap-[4px]"
                style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}
              >
                {Array.from({ length: 52 }).map((_, w) => (
                  <div key={w} className="grid grid-rows-7 gap-[4px]">
                    {Array.from({ length: 7 }).map((_, d) => (
                      <div
                        key={d}
                        className="aspect-square w-full border border-[rgba(64,61,82,0.6)] bg-[rgba(31,29,46,0.8)]"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 mt-8 h-px bg-[rgba(64,61,82,0.5)]" />

        <section>
          <div className="mb-10 flex items-center gap-4">
            <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
              /featured_projects
            </span>
            <div className="h-px w-10 bg-gradient-to-r from-[rgba(49,116,143,0.45)] to-transparent" />
            <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.25em] text-[rgba(224,222,244,0.75)]">
              Featured Projects
            </h2>
            <div className="h-px flex-1 bg-[rgba(64,61,82,0.8)]" />
          </div>
          <div className="grid animate-pulse grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="relative flex h-[190px] flex-col border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.55)] p-[22px]"
              >
                <div className="mb-3 flex justify-between">
                  <div className="h-2 w-12 rounded bg-[rgba(64,61,82,0.6)]" />
                  <div className="h-2 w-8 rounded bg-[rgba(64,61,82,0.6)]" />
                </div>
                <div className="mb-[10px] h-3 w-3/4 rounded bg-[rgba(64,61,82,0.6)]" />
                <div className="mb-1.5 h-2 w-full rounded bg-[rgba(64,61,82,0.45)]" />
                <div className="mb-1.5 h-2 w-5/6 rounded bg-[rgba(64,61,82,0.45)]" />
                <div className="mb-4 h-2 w-2/3 rounded bg-[rgba(64,61,82,0.45)]" />
                <div className="flex gap-1.5">
                  <div className="h-4 w-12 rounded bg-[rgba(64,61,82,0.5)]" />
                  <div className="h-4 w-16 rounded bg-[rgba(64,61,82,0.5)]" />
                  <div className="h-4 w-10 rounded bg-[rgba(64,61,82,0.5)]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}

function ProjectsPage() {
  const result = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(20px,2.5vh)]">
      <section>
        <header className="mb-10 opacity-100">
          <div className="mb-2">
            <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
              /contributions
            </span>
          </div>
          <h1 className="mono m-0 mb-[6px] text-[clamp(26px,5vw,44px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
            PROJECTS
          </h1>
          <p className="m-0 mt-0 max-w-[480px] text-[13px] leading-[1.65] text-[rgba(144,140,170,0.8)]">
            Live GitHub repositories and contribution activity.
          </p>
        </header>

        {!result.ok ? (
          <ErrorPanel title="GitHub API Unavailable" error={result.error} />
        ) : (
          <>
            <ContributionGrid
              username={result.data.username}
              calendar={result.data.contributions}
            />

            <div className="mb-8 mt-8 h-px bg-[rgba(64,61,82,0.5)]" />

            <section>
              <div className="mb-10 flex items-center gap-4">
                <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
                  /featured_projects
                </span>
                <div className="h-px w-10 bg-gradient-to-r from-[rgba(49,116,143,0.45)] to-transparent" />
                <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.25em] text-[rgba(224,222,244,0.75)]">
                  Featured Projects
                </h2>
                <div className="h-px flex-1 bg-[rgba(64,61,82,0.8)]" />
              </div>

              {result.data.projects.length === 0 ? (
                <EmptyState
                  title="No featured repositories"
                  description="Tag a repository with the 'featured' topic on GitHub to display it here."
                />
              ) : (
                <ProjectsGrid repos={result.data.projects} />
              )}
            </section>
          </>
        )}
      </section>
    </PageShell>
  );
}
