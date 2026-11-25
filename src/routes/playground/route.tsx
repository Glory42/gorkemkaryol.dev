import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { TerminalPrompt } from "@/components/layout/page";
import { BackLink } from "@/components/ui/BackLink";

export const Route = createFileRoute("/playground")({
  component: PlaygroundLayout,
});

function PlaygroundLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sub = pathname.replace(/^\/playground\/?/, "").split("/")[0];

  return (
    <PageShell>
      <section className="mx-auto max-w-[900px]">
        <TerminalPrompt cmd={sub ? `cd ./playground/${sub}` : "ls ./playground"} className="mb-3" />
        {sub ? <BackLink to="/playground">back to playground</BackLink> : <div className="mb-5" />}
        <Outlet />
      </section>
    </PageShell>
  );
}
