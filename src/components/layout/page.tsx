import type { ReactNode } from "react";

// Shared route chrome: the one main-column frame, the <head> meta shape, and
// the `~$ cmd` prompt line that opens most pages.

/** The standard PageShell main-column classes. A few routes need a variant. */
export const PAGE_MAIN = "px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]";

/** Route `head` meta from a page name + description. Empty name = site root. */
export function pageHead(name: string, description: string) {
  return {
    meta: [
      { title: name ? `${name} | Gorkem Karyol` : "Gorkem Karyol" },
      { name: "description", content: description },
    ],
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
    <p className={`mono text-[11px] text-[#252525] ${className}`}>
      ~$ {cmd}
      {children}
    </p>
  );
}
