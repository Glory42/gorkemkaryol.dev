import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";

const CoolTerminal = lazy(
  () => import("@/components/ui/coolTerminal/CoolTerminal"),
);

export const Route = createFileRoute("/cool")({
  head: () => ({
    meta: [
      { title: "Cool | Gorkem Karyol" },
      {
        name: "description",
        content: "Interactive terminal with games and animations.",
      },
    ],
  }),
  component: CoolPage,
});

function CoolPage() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(40px,5vh)]">
      <section>
        <header className="mb-10 opacity-100">
          <div className="mb-2">
            <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
              /cool
            </span>
          </div>
          <h1 className="mono m-0 mb-[6px] text-[clamp(26px,5vw,44px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
            COOL
          </h1>
          <p className="m-0 mt-0 max-w-[480px] text-[13px] leading-[1.65] text-[rgba(144,140,170,0.8)]">
            Interactive terminal. Type{" "}
            <span className="mono text-[rgba(156,207,216,0.8)]">help</span> to
            see available commands.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="mono text-[11px] text-[rgba(144,140,170,0.6)]">
              Loading terminal...
            </div>
          }
        >
          <CoolTerminal />
        </Suspense>
      </section>
    </PageShell>
  );
}
