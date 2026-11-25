import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Skip the bottom padding, for a layout that pads its own column instead (home's pinned panel). */
  flushBottom?: boolean;
}

// No page-level entrance: content must be on screen at first paint, not after an effect.
export function PageShell({ children, flushBottom = false }: Props) {
  return (
    <main
      id="main-content"
      className={`px-[max(24px,4vw)] pt-[var(--page-pt)] ${flushBottom ? "" : "pb-20"}`}
    >
      {children}
    </main>
  );
}
