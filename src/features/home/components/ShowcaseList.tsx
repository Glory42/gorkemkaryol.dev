import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/Skeleton";
import { HomeSection } from "@/features/home/components/HomeSection";
import type { ShowcaseResult } from "@/features/home/home-data";

const linkClass = "tap-target inline-flex items-center gap-1 no-underline hover:text-accent";

function Projects({ result }: { result: ShowcaseResult }) {
  if (!result.ok) {
    return <p className="mono text-[13px] text-fg-3">GitHub is unreachable right now.</p>;
  }
  if (result.projects.length === 0) {
    return <p className="mono text-[13px] text-fg-3">Nothing tagged showcase yet.</p>;
  }
  return (
    <div className="stagger flex flex-col">
      {result.projects.map((project) => {
        const { live, code } = project;
        return (
          <article
            key={project.name}
            className="group border-b border-[rgba(255,255,255,0.05)] py-6 first:pt-1"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 leading-none">
              <Link
                to="/projects/$slug"
                params={{ slug: project.name }}
                className="focus-ring tap-target mono text-[17px] font-bold text-white no-underline group-hover:text-accent"
              >
                {project.name}
              </Link>
              <span className="mono inline-flex items-center gap-3 text-[12px] text-fg-3">
                {live && (
                  <a href={live} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <Globe size={12} aria-hidden="true" /> live
                  </a>
                )}
                {code && (
                  <a href={code} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <GithubIcon size={12} /> code
                  </a>
                )}
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-[1.7] text-fg-2">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[project.language, ...project.tags].filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="mono border border-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[11px] text-fg-3"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

// Same box as a loaded project (title row, three description lines, tags), so
// a cold cache reserves the list's height and the real rows don't shift the page.
function ProjectsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-b border-[rgba(255,255,255,0.05)] py-6 first:pt-1">
          <div className="flex h-[17px] items-center gap-4">
            <SkeletonLine className="h-4 w-44" />
            <SkeletonBlock className="h-3 w-10 rounded" />
            <SkeletonBlock className="h-3 w-10 rounded" />
          </div>
          <div className="mt-2 flex flex-col">
            {["w-full", "w-full", "w-2/3"].map((width, line) => (
              <div key={line} className="flex h-[23.8px] items-center">
                <SkeletonBlock className={`h-3 rounded ${width}`} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5">
            {["w-20", "w-12", "w-16", "w-14"].map((width) => (
              <SkeletonLine key={width} className={`h-6 ${width}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Repos tagged `showcase` on GitHub, newest push first; "live" comes from each repo's Website field.
// A cold cache has no snapshot to paint, so it holds the list's space with a
// skeleton while the client revalidation fills the cache.
export function ShowcaseList({
  showcase,
  pending = false,
}: {
  showcase: ShowcaseResult;
  pending?: boolean;
}) {
  return (
    <HomeSection cmd="ls ~/projects --mine" more="/projects">
      <div aria-live="polite">
        {pending ? <ProjectsSkeleton /> : <Projects result={showcase} />}
      </div>
    </HomeSection>
  );
}
