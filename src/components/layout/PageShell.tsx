import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  mainClassName?: string;
}

// The whole-page fade-in should only play once, on the very first paint of
// the session. `<main>` gets a fresh DOM node on every client-side route
// change (it's inside <Outlet />), so without this guard the CSS animation
// would replay — and dim the entire page — on every internal navigation.
//
// The decision is made in an effect, never during render: reading/writing
// this flag while rendering would make the very first client render depend
// on state a server render can't see (and, since the SSR worker can reuse
// its module scope across requests, on a previous *request's* state too),
// producing a hydration mismatch. An effect only runs in the browser after
// hydration, so the flag is purely a client-session concern.
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
