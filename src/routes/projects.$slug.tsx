import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { ChevronLeft, ExternalLink } from "lucide-react";
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
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto max-w-[860px]">
        <p className="mono text-[11px] text-[#333]">404 — repository not found</p>
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

function ProjectReadmePage() {
  const data = Route.useLoaderData() as {
    repo: string;
    repoUrl: string;
    html: string;
    hadError: boolean;
  };
  const { repo, repoUrl, html, hadError } = data;

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto min-w-0 max-w-[860px] overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/projects"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-[rgba(168,85,247,0.85)]"
          >
            <ChevronLeft size={11} />
            back to projects
          </Link>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring text-[#2a2a2a] transition-colors hover:text-[rgba(168,85,247,0.85)]"
            aria-label={`Open ${repo} on GitHub`}
          >
            <ExternalLink size={13} />
          </a>
        </div>

        <ReadmeArticle html={html} hadError={hadError} />
      </div>
    </PageShell>
  );
}
