import { createFileRoute, defer } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { SignOff } from "@/components/layout/SignOff";
import { pageHead } from "@/components/layout/page";
import { ContributedList } from "@/features/home/components/ContributedList";
import { ExperienceLog } from "@/features/home/components/ExperienceLog";
import { IdentityPanel } from "@/features/home/components/IdentityPanel";
import { SetupList } from "@/features/home/components/SetupList";
import { ShowcaseList } from "@/features/home/components/ShowcaseList";
import { getCurrentlyServerFn, getShowcaseServerFn } from "@/features/home/home-data";
import { SITE_DESCRIPTION } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => pageHead("", SITE_DESCRIPTION, "/"),
  // Drawn inside the right column, so nothing below the grid pushes the pinned panel.
  staticData: { ownSignOff: true },
  // Deferred, so the page renders at once and each block streams in when its source answers.
  loader: () => ({ live: defer(getCurrentlyServerFn()), showcase: defer(getShowcaseServerFn()) }),
  component: HomePage,
});

function HomePage() {
  const { live, showcase } = Route.useLoaderData();
  return (
    // The bottom padding sits on the right column: the pinned panel ignores its container's padding.
    <PageShell flushBottom>
      <div className="home-grid mx-auto grid max-w-[900px] gap-x-10 gap-y-14 md:grid-cols-[300px_1fr]">
        <IdentityPanel live={live} />
        <div className="min-w-0 pb-20">
          <div className="home-stack">
            <ShowcaseList showcase={showcase} />
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
