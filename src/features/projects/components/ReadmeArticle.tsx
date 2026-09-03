import type { MouseEvent } from "react";
import { StatusPanel } from "@/components/ui/StatusPanel";

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
        <div className="mb-6">
          <StatusPanel tone="degraded" />
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
