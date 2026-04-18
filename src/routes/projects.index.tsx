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
  component: ProjectsPage,
});

function ProjectsPage() {
  const result = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(40px,5vh)]">
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
