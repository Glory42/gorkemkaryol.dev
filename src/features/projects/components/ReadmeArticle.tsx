import type { MouseEvent } from "react";

interface Props {
  html: string;
  hadError: boolean;
}

export function ReadmeArticle({ html, hadError }: Props) {
  // Router scroll restoration eats the native `#slug` jump, so scroll the
  // heading in ourselves (scroll-margin-top clears the fixed navbar).
  function onAnchorClick(e: MouseEvent<HTMLDivElement>) {
    const link = (e.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (!link || !href || !href.startsWith("#")) return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "instant", block: "start" });
  }

  return (
    <div>
      {hadError && (
        <div className="mb-6 border border-[rgba(246,193,119,0.3)] bg-[rgba(246,193,119,0.06)] px-4 py-3">
          <p className="mono text-[11px] text-[rgba(246,193,119,0.85)]">
            Markdown rendering encountered an issue — showing plain text fallback.
          </p>
        </div>
      )}

      <div
        className="readme-prose"
        onClick={onAnchorClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
