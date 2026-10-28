import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  mainClassName?: string;
}

// Fade in once per session; flagged in an effect, since reading it in render breaks hydration.
let hasPlayedEntrance = false;

export function PageShell({ children, mainClassName }: Props) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (hasPlayedEntrance) return;
    hasPlayedEntrance = true;
    setShouldAnimate(true);
  }, []);

  return (
    <main
      id="main-content"
      className={
        (shouldAnimate ? "page-enter " : "") +
        (mainClassName ??
          "mx-auto w-full max-w-6xl px-4 pb-10 pt-10 md:px-8 md:pt-14")
      }
    >
      {children}
    </main>
  );
}
