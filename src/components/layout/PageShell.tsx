import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  mainClassName?: string;
}

export function PageShell({ children, mainClassName }: Props) {
  return (
    <main
      id="main-content"
      className={
        mainClassName ??
        "mx-auto w-full max-w-6xl px-4 pb-10 pt-10 md:px-8 md:pt-14"
      }
    >
      {children}
    </main>
  );
}
