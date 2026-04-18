import { ExternalLink } from "lucide-react";

interface Props {
  html: string;
  hadError: boolean;
  repoUrl: string;
  repo: string;
}

export function ReadmeArticle({ html, hadError, repoUrl, repo }: Props) {
  return (
    <div>
      {hadError && (
        <div className="mb-6 border border-[rgba(246,193,119,0.3)] bg-[rgba(246,193,119,0.06)] px-4 py-3">
          <p className="mono text-[11px] text-[rgba(246,193,119,0.85)]">
            Markdown rendering encountered an issue — showing plain text
            fallback.
          </p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
          README.md
        </span>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mono inline-flex items-center gap-1.5 border border-[rgba(64,61,82,0.8)] px-2 py-[3px] text-[9px] tracking-[0.1em] text-[rgba(110,106,134,0.7)] no-underline transition-colors hover:border-[rgba(196,167,231,0.3)] hover:text-[rgba(196,167,231,0.7)]"
          aria-label={`Open ${repo} on GitHub`}
        >
          <ExternalLink size={9} />
          {repo}
        </a>
      </div>

      <div
        className="readme-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
