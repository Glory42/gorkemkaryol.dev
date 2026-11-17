import { lazy, Suspense } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { TerminalPrompt } from "@/components/layout/page";
import { openCommandPalette } from "@/features/palette/CommandPalette";
import { H, W } from "@/features/not-found/runner-logic";
import type { SectionHref } from "@/lib/sections";

const RunnerGame = lazy(() =>
  import("@/features/not-found/components/RunnerGame").then((m) => ({ default: m.RunnerGame })),
);

interface Props {
  title?: string;
  message?: string;
  backTo?: SectionHref;
  backLabel?: string;
}

// The router's 404: an offline-style runner to play while you find your way back.
export function NotFoundPage({
  title = "This page went offline.",
  message = "Nothing lives at this address. Jump a few firewalls while you're here, or head back.",
  backTo = "/",
  backLabel = "cd ~",
}: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[680px] px-[max(24px,4vw)] pb-16 pt-[max(24px,4vh)]"
    >
      <TerminalPrompt cmd={`curl -I ${pathname}`} className="mb-2 animate-fade-in" />
      <p className="mono mb-6 text-[12px] text-accent/[0.75] animate-fade-in">
        HTTP/1.1 404 Not Found
      </p>

      <h1 className="mono mb-2 text-[clamp(20px,2.2vw,30px)] font-bold leading-[1.1] tracking-[-0.01em] text-white animate-fade-in-down">
        {title}
      </h1>
      <p className="mb-8 text-[13px] leading-[1.75] text-fg-2 animate-fade-in-up delay-100">
        {message}
      </p>

      <div className="animate-fade-in-up delay-150">
        <Suspense
          fallback={
            <div
              className="w-full border border-[rgba(255,255,255,0.06)]"
              style={{ aspectRatio: `${W} / ${H}` }}
            />
          }
        >
          <RunnerGame />
        </Suspense>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 animate-fade-in-up delay-200">
        <Link
          to={backTo}
          className="focus-ring mono inline-flex items-center border border-accent/[0.4] px-4 py-2 text-[11px] tracking-[0.12em] text-accent/[0.85] no-underline transition-colors hover:border-accent hover:text-accent"
        >
          {backLabel}
        </Link>
        <button
          type="button"
          onClick={openCommandPalette}
          className="focus-ring mono cursor-pointer text-[11px] tracking-[0.08em] text-fg-3 transition-colors hover:text-fg-1"
        >
          or search with ^K
        </button>
      </div>
    </main>
  );
}
