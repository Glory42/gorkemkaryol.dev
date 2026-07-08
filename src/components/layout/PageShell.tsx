import { useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  mainClassName?: string;
}

// The whole-page fade-in should only play once, on the very first paint of
// the session. `<main>` gets a fresh DOM node on every client-side route
// change (it's inside <Outlet />), so without this guard the CSS animation
// would replay — and dim the entire page — on every internal navigation.
let hasPlayedEntrance = false;

export function PageShell({ children, mainClassName }: Props) {
  const [shouldAnimate] = useState(() => {
    if (hasPlayedEntrance) return false;
    hasPlayedEntrance = true;
    return true;
  });

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
