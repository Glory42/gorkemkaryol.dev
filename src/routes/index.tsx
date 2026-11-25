import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { SignOff } from "@/components/layout/SignOff";
import { pageHead } from "@/components/layout/page";
import { ContributedList } from "@/features/home/components/ContributedList";
import { ExperienceLog } from "@/features/home/components/ExperienceLog";
import { IdentityPanel } from "@/features/home/components/IdentityPanel";
import { SetupList } from "@/features/home/components/SetupList";
import { ShowcaseList } from "@/features/home/components/ShowcaseList";
import {
  getCurrentlyServerFn,
  getShowcaseServerFn,
  revalidateCurrentlyServerFn,
  revalidateShowcaseServerFn,
} from "@/features/home/home-data";
import { SITE_DESCRIPTION } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => pageHead("", SITE_DESCRIPTION, "/"),
  // Drawn inside the right column, so nothing below the grid pushes the pinned panel.
  staticData: { ownSignOff: true },
  // Cache reads only, so the first HTML has whatever the last visit cached and
  // closes at once; a cold cache paints a fetching state instead of blocking.
  loader: async () => {
    const [live, showcase] = await Promise.all([getCurrentlyServerFn(), getShowcaseServerFn()]);
    return { live, showcase };
  },
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  const [live, setLive] = useState(data.live.value);
  const [showcase, setShowcase] = useState(data.showcase.value);
  const [showcasePending, setShowcasePending] = useState(!data.showcase.cached);

  // Refresh each stale source after paint, independently: the showcase is the
  // big block, so it must not wait on a slow book/movie API.
  useEffect(() => {
    if (!data.showcase.stale) return;

    let cancelled = false;
    void revalidateShowcaseServerFn()
      .then((fresh) => {
        if (cancelled) return;
        // A failed refresh must not replace a good stale snapshot.
        setShowcase((previous) =>
          fresh.ok || !previous.ok || previous.projects.length === 0 ? fresh : previous,
        );
        setShowcasePending(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Keep a real snapshot if we had one; otherwise show the failure
        // instead of a fetching state that can never finish.
        setShowcase((previous) =>
          previous.ok && previous.projects.length > 0 ? previous : { ok: false },
        );
        setShowcasePending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [data.showcase.stale]);

  useEffect(() => {
    if (!data.live.stale) return;

    let cancelled = false;
    void revalidateCurrentlyServerFn()
      .then((fresh) => {
        if (cancelled) return;
        setLive((previous) => (fresh.ok || !previous.ok ? fresh : previous));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [data.live.stale]);

  return (
    // The bottom padding sits on the right column: the pinned panel ignores its container's padding.
    <PageShell flushBottom>
      <div className="home-grid mx-auto grid max-w-[900px] gap-x-10 gap-y-14 md:grid-cols-[300px_1fr]">
        <IdentityPanel live={live} />
        <div className="min-w-0 pb-20">
          <div className="home-stack">
            <ShowcaseList showcase={showcase} pending={showcasePending} />
            <ContributedList />
            <ExperienceLog />
            <SetupList />
          </div>
          <SignOff className="mt-16" />
        </div>
      </div>
    </PageShell>
  );
}
