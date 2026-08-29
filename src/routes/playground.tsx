import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { BackLink } from "@/components/ui/BackLink";

export const Route = createFileRoute("/playground")({
  component: PlaygroundLayout,
});

function PlaygroundLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sub = pathname.replace(/^\/playground\/?/, "").split("/")[0];

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-16 pt-[max(12px,1.5vh)]">
      <section className="mx-auto max-w-[900px]">
        <p className="mono mb-3 text-[11px] text-[#252525]">
          {sub ? `~$ cd ./playground/${sub}` : "~$ ls ./playground"}
        </p>
        {sub ? (
          <BackLink to="/playground">back to playground</BackLink>
        ) : (
          <div className="mb-5" />
        )}
        <Outlet />
      </section>
    </PageShell>
  );
}
