import type { ReactNode } from "react";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

// Shared route chrome: the main-column classes, <head> meta and the `~$ cmd` prompt.

/** The standard PageShell main-column classes. A few routes need a variant. */
export const PAGE_MAIN = "px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]";

// Route `head` from a page name, description and path; empty name = site root.
export function pageHead(name: string, description: string, path: string) {
  const title = name ? `${name} | ${SITE_NAME}` : SITE_NAME;
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function TerminalPrompt({
  cmd,
  className = "",
  children,
}: {
  cmd: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <p className={`mono text-[12px] text-fg-4 ${className}`}>
      ~$ {cmd}
      {children}
    </p>
  );
}
