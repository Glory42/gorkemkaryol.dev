import { ExternalLink, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { GithubProject } from "@/server/github";

interface Props {
  repos: GithubProject[];
}

export function ProjectsGrid({ repos }: Props) {
  return (
    <div className="flex flex-col">
      {repos.map((repo) => {
        const tags = repo.topics.filter((t) => t !== "featured").slice(0, 3);
        const lang = repo.primaryLanguage?.name;

        return (
          <div
            key={repo.url}
            className="group flex items-start gap-5 border-b border-[rgba(255,255,255,0.04)] py-5"
          >
            <div className="min-w-0 flex-1">
              <Link
                to="/projects/$slug"
                params={{ slug: repo.name }}
                className="focus-ring mono block text-[14px] font-semibold text-white no-underline transition-colors duration-150 group-hover:text-[#a855f7]"
              >
                {repo.name}
              </Link>
              {repo.description && (
                <p className="mt-1 text-[12px] leading-[1.6] text-[#444]">
                  {repo.description}
                </p>
              )}
              {(tags.length > 0 || lang) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {lang && (
                    <span className="mono text-[10px] text-[#383838]">{lang}</span>
                  )}
                  {lang && tags.length > 0 && (
                    <span className="h-[10px] w-px bg-[rgba(255,255,255,0.07)]" />
                  )}
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono border border-[rgba(168,85,247,0.3)] px-[6px] py-[2px] text-[8px] tracking-[0.08em] text-[rgba(168,85,247,0.65)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2.5 pt-[2px]">
              {repo.stargazerCount > 0 && (
                <span className="mono flex items-center gap-1 text-[11px] text-[#333]">
                  <Star size={9} className="text-[rgba(246,193,119,0.6)]" />
                  {repo.stargazerCount}
                </span>
              )}
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring text-[#2a2a2a] transition-colors hover:text-[#a855f7]"
                aria-label={`Open ${repo.name} on GitHub`}
              >
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
