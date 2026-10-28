import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { pageHead } from "@/components/layout/page";
import { DataPage, PageFrame } from "@/components/ui/DataPage";
import { ResultSection } from "@/components/ui/DataSection";
import { TerminalTabs } from "@/components/ui/TerminalTabs";
import { PosterGrid, PosterGridSkeleton } from "@/features/interests/components/PosterGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  currentlyWatchingToDisplayItem,
  WATCHED_FILTERS,
  watchedItems,
  watchStatsLabel,
  type WatchedFilter,
} from "@/features/interests/display-item";
import {
  getCurrentlyWatchingSerials,
  getInterisProfile,
  getWatchedMedia,
  type WatchedMedia,
} from "@/server/interis/interis";
import { runSources } from "@/server/common/page-data";

// Three Interis reads that fail independently, folded into one round-trip.
const getWatchingPageDataServerFn = createServerFn({ method: "GET" }).handler(
  () =>
    runSources({
      currentlyWatching: (env, ctx) => getCurrentlyWatchingSerials(env, ctx, 30),
      watched: (env, ctx) => getWatchedMedia(env, ctx, 200),
      profile: getInterisProfile,
    }),
);

export const Route = createFileRoute("/interests/watching")({
  head: () =>
    pageHead(
      "Watching",
      "Currently watching, watched series, and watched films from Interis.",
    ),
  loader: async () => getWatchingPageDataServerFn(),
  pendingMs: 0,
  pendingComponent: WatchingPageSkeleton,
  component: WatchingPage,
});

const CMD = "cat ./interests/watching";

function WatchingPageSkeleton() {
  return (
    <DataPage.Skeleton
      cmd={CMD}
      promptAside={
        <div className="h-2.5 w-44 animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
      }
      backTo="/interests"
      backLabel="back to interests"
    >
      <section className="mb-10">
        <SectionHeader sig="./currently-watching" />
        <PosterGridSkeleton count={4} />
      </section>

      <section>
        <SectionHeader sig="./watched" />
        <PosterGridSkeleton count={10} />
      </section>
    </DataPage.Skeleton>
  );
}

function WatchedSection({ media }: { media: WatchedMedia }) {
  const [filter, setFilter] = useState<WatchedFilter>("all");
  const items = useMemo(() => watchedItems(media, filter), [media, filter]);

  return (
    <section>
      <SectionHeader sig="./watched" />
      <TerminalTabs
        options={WATCHED_FILTERS}
        value={filter}
        onChange={setFilter}
        className="mb-6"
      />
      <PosterGrid
        items={items}
        emptyTitle="Nothing here yet"
        emptyDescription="No watched titles found for this filter."
      />
    </section>
  );
}

function WatchingPage() {
  const { currentlyWatching, watched, profile } = Route.useLoaderData();

  return (
    <PageFrame
      cmd={CMD}
      promptAside={
        profile.ok ? (
          <p className="mono text-[11px] text-accent/[0.6]">
            {watchStatsLabel(profile.data.stats)}
          </p>
        ) : undefined
      }
      backTo="/interests"
      backLabel="back to interests"
    >
      {currentlyWatching.ok && currentlyWatching.data.length > 0 && (
        <section className="mb-10">
          <SectionHeader sig="./currently-watching" />
          <PosterGrid
            items={currentlyWatching.data.map(currentlyWatchingToDisplayItem)}
            emptyTitle="Nothing in progress"
            emptyDescription="No serials currently being watched on Interis."
          />
        </section>
      )}

      <ResultSection result={watched} errorTitle="Interis API Unavailable">
        {(data) => <WatchedSection media={data} />}
      </ResultSection>
    </PageFrame>
  );
}
