import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { pageHead } from "@/components/layout/page";
import { DataPage } from "@/components/ui/DataPage";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StatusPage } from "@/components/ui/StatusPage";
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
  head: ({ params }) => pageHead(params.slug, `README for ${params.slug}.`),
  loader: async ({ params }) => {
    const result = await getProjectReadmeServerFn({ data: params.slug });
    if (!result.ok && result.error.code === "NOT_FOUND") throw notFound();
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
    <DataPage.Skeleton
      cmd={`cat ./projects/${slug}`}
      maxWidth={860}
      wrapClassName="overflow-x-clip"
      backTo="/projects"
      backLabel="back to projects"
    >
      <div className="space-y-3">
        <div className="h-4 w-1/3 rounded bg-[rgba(255,255,255,0.05)]" />
        <SkeletonBlock className="h-2.5 w-full rounded" />
        <SkeletonBlock className="h-2.5 w-[92%] rounded" />
        <SkeletonBlock className="h-2.5 w-[75%] rounded" />
        <SkeletonBlock className="mt-4 h-2.5 w-full rounded" />
        <SkeletonBlock className="h-2.5 w-[88%] rounded" />
        <SkeletonBlock className="h-2.5 w-[60%] rounded" />
      </div>
    </DataPage.Skeleton>
  );
}

function ReadmeLink({ readme }: { readme: ProjectReadme }) {
  return (
    <a
      href={readme.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] text-[#333] no-underline transition-colors hover:text-accent/[0.85]"
      aria-label={
        readme.kind === "manual"
          ? `Visit ${readme.title}`
          : `Open ${readme.title} on GitHub`
      }
    >
      {readme.kind === "manual" ? (
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
  );
}

function ProjectReadmePage() {
  const { slug } = Route.useParams();
  // A validated createServerFn whose loader can throw notFound() widens the
  // data; the loader's own guards are what actually narrow it.
  const result = Route.useLoaderData() as ServiceResult<ProjectReadme>;

  return (
    <DataPage
      cmd={`cat ./projects/${slug}`}
      maxWidth={860}
      wrapClassName="overflow-x-clip"
      backTo="/projects"
      backLabel="back to projects"
      result={result}
      errorTitle="GitHub API Unavailable"
      rightSlot={(readme) => <ReadmeLink readme={readme} />}
    >
      {(readme) => (
        <ReadmeArticle html={readme.html} hadError={readme.hadError} />
      )}
    </DataPage>
  );
}
