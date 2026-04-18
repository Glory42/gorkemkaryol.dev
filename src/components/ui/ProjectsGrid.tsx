import { ExternalLink, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { GithubProject } from "@/server/github";

interface Props {
  repos: GithubProject[];
}

export function ProjectsGrid({ repos }: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3">
      {repos.map((repo, index) => {
        const cardId = String(index + 1).padStart(3, "0");
        const tags =
          repo.topics.length > 0
            ? repo.topics.slice(0, 4)
            : [repo.primaryLanguage?.name ?? "Repository"];

        return (
          <article
            key={repo.url}
            className="group relative flex h-full flex-col border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.55)] p-[22px]"
          >
            <Link
              to="/projects/$slug"
              params={{ slug: repo.name }}
              className="absolute inset-0 z-0"
              aria-label={`Read README for ${repo.name}`}
            />
            <span className="pointer-events-none absolute left-0 top-0 h-[8px] w-[8px] border-l border-t border-[rgba(196,167,231,0.25)]" />
            <span className="pointer-events-none absolute right-0 top-0 h-[8px] w-[8px] border-r border-t border-[rgba(196,167,231,0.25)]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-[8px] w-[8px] border-b border-l border-[rgba(196,167,231,0.25)]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-[8px] w-[8px] border-b border-r border-[rgba(196,167,231,0.25)]" />

            <div className="relative mb-3 flex items-center justify-between">
              <span className="mono text-[8px] tracking-[0.12em] text-[rgba(110,106,134,0.7)]">
                PROJ-{cardId}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star
                  size={9}
                  className={
                    repo.stargazerCount > 0
                      ? "text-[rgba(246,193,119,0.7)]"
                      : "text-[rgba(110,106,134,0.7)]"
                  }
                  fill={
                    repo.stargazerCount > 0 ? "rgba(246,193,119,0.7)" : "none"
                  }
                />
                <span className="mono text-[9px] text-[rgba(110,106,134,0.7)]">
                  {repo.stargazerCount}
                </span>
              </span>
            </div>

            <h3 className="mono mb-[10px] text-[13px] font-semibold leading-[1.3] tracking-[0.03em] text-[rgb(224,222,244)] group-hover:text-[rgb(196,167,231)]">
              {repo.name}
            </h3>

            <p className="mb-4 flex-1 text-[12px] leading-[1.65] text-[rgba(144,140,170,0.88)]">
              {repo.description}
            </p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-[5px]">
                {tags.map((tag) => (
                  <span
                    key={`${repo.name}-${tag}`}
                    className="mono border border-[rgba(49,116,143,0.2)] px-1.5 py-[2px] text-[8px] tracking-[0.1em] text-[rgba(49,116,143,0.75)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring relative z-10 text-[rgba(49,116,143,0.55)] transition-colors hover:text-[rgba(49,116,143,0.95)]"
                aria-label={`Open ${repo.name} on GitHub`}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={11} />
              </a>
            </div>

            <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
          </article>
        );
      })}
    </div>
  );
}
