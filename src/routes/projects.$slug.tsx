import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { ChevronLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ReadmeArticle } from "@/components/ui/ReadmeArticle";
import { readRuntimeEnv } from "@/lib/env";
import { getRepoReadmeData } from "@/server/github";
import { renderMarkdownToHTML } from "@/server/markdown";

const getRepoReadmeServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data: slug }) => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    const readmeData = await getRepoReadmeData(slug, runtimeEnv);

    if (!readmeData || readmeData.readme === null) {
      return null;
    }

    const { html, hadError } = renderMarkdownToHTML(
      readmeData.readme,
      readmeData.owner,
      readmeData.repo,
      readmeData.defaultBranch,
      readmeData.repoUrl,
    );

    return {
      repo: readmeData.repo,
      repoUrl: readmeData.repoUrl,
      html,
      hadError,
    };
  });

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | Gorkem Karyol` },
      { name: "description", content: `README for ${params.slug}.` },
    ],
  }),
  loader: async ({ params }) => {
    const data = await getRepoReadmeServerFn({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  notFoundComponent: () => (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(40px,5vh)]">
      <div className="panel p-6">
        <p className="mono text-[11px] tracking-[0.15em] text-[rgba(49,116,143,0.85)]">
          404
        </p>
        <h1 className="mono mt-2 text-xl text-[rgb(224,222,244)]">
          Repository not found
        </h1>
        <p className="mt-3 text-sm text-[rgba(144,140,170,0.9)]">
          No README was found for this repository.
        </p>
        <div className="mt-5">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 border border-[rgba(64,61,82,0.9)] px-3 py-2 text-[10px] uppercase tracking-[0.12em] no-underline"
          >
            <ChevronLeft size={11} />
            Back to Projects
          </Link>
        </div>
      </div>
    </PageShell>
  ),
  component: ProjectReadmePage,
});

function ProjectReadmePage() {
  const data = Route.useLoaderData() as {
    repo: string;
    repoUrl: string;
    html: string;
    hadError: boolean;
  };
  const { repo, repoUrl, html, hadError } = data;

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(40px,5vh)]">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-8">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[rgba(110,106,134,0.7)] no-underline transition-colors hover:text-[rgba(196,167,231,0.8)]"
          >
            <ChevronLeft size={11} />
            back to projects
          </Link>
        </div>

        <header className="mb-10">
          <div className="mb-2">
            <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
              /projects
            </span>
          </div>
          <h1 className="mono m-0 mb-[6px] text-[clamp(22px,4vw,38px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
            {repo}
          </h1>
        </header>

        <div className="border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.4)] p-6 md:p-10">
          <ReadmeArticle
            html={html}
            hadError={hadError}
            repoUrl={repoUrl}
            repo={repo}
          />
        </div>
      </div>
    </PageShell>
  );
}
