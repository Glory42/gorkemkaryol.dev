import { ExternalLink, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ProjectCard } from "@/features/projects/projects";

interface Props {
  repos: ProjectCard[];
}

export function ProjectsGrid({ repos }: Props) {
  return (
    <div className="flex flex-col stagger">
      {repos.map((repo) => {
        const tags = repo.tags.slice(0, 3);
        const lang = repo.language;
        const href = repo.code ?? repo.live;

        return (
          <div
            key={repo.name}
            className="group border-b border-[rgba(255,255,255,0.04)] pb-5 pt-5 first:pt-0"
          >
            <div className="flex items-start justify-between gap-4">
              <Link
                to="/projects/$slug"
                params={{ slug: repo.name }}
                className="focus-ring tap-target mono min-w-0 break-words text-[14px] font-semibold text-white no-underline transition-colors duration-150 group-hover:text-accent"
              >
                {repo.name}
              </Link>
              <div className="flex shrink-0 items-center gap-2.5 pt-[2px]">
                {repo.stars > 0 && (
                  <span className="mono flex items-center gap-1 text-[12px] text-fg-4">
                    <Star size={9} className="text-[rgba(246,193,119,0.6)]" />
                    {repo.stars}
                  </span>
                )}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring tap-target text-fg-4 transition-colors hover:text-accent"
                    aria-label={repo.code ? `Open ${repo.name} on GitHub` : `Open the ${repo.name} site`}
                  >
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
            {repo.description && (
              <p className="mt-1 text-[13px] leading-[1.6] text-fg-3">
                {repo.description}
              </p>
            )}
            {(tags.length > 0 || lang) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {lang && (
                  <span className="mono text-[11px] text-fg-3">{lang}</span>
                )}
                {lang && tags.length > 0 && (
                  <span className="h-[10px] w-px bg-[rgba(255,255,255,0.07)]" />
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="mono border border-accent/[0.3] px-[6px] py-[2px] text-[11px] text-accent/[0.65]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
