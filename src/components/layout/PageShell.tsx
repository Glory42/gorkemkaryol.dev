import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Skip the bottom padding, for a layout that pads its own column instead (home's pinned panel). */
  flushBottom?: boolean;
}

// Fade in once per session; flagged in an effect, since reading it in render breaks hydration.
let hasPlayedEntrance = false;

export function PageShell({ children, flushBottom = false }: Props) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (hasPlayedEntrance) return;
    hasPlayedEntrance = true;
    setShouldAnimate(true);
  }, []);

  return (
    <main
      id="main-content"
      className={`px-[max(24px,4vw)] pt-[var(--page-pt)] ${flushBottom ? "" : "pb-20"} ${
        shouldAnimate ? "page-enter" : ""
      }`}
    >
      {children}
    </main>
  );
}
