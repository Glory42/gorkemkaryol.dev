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
  watchedMovieToDisplayItem,
  watchedSerialToDisplayItem,
  type DisplayItem,
} from "@/features/interests/display-item";
import {
  getCurrentlyWatchingSerials,
  getInterisProfile,
  getWatchedMedia,
  type WatchedMovie,
  type WatchedSerial,
} from "@/server/interis/interis";
import { runSources } from "@/server/common/page-data";

// Composite loader: three Interis reads that fail independently, folded into
// one round-trip (the page shows a single skeleton, not per-section streaming).
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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "series", label: "Series" },
  { id: "films", label: "Films" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

function WatchedSection({
  serials,
  movies,
}: {
  serials: WatchedSerial[];
  movies: WatchedMovie[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  // Sort the raw entries by recency once; filter + map to a DisplayItem per render.
  const recent = useMemo<(WatchedSerial | WatchedMovie)[]>(
    () =>
      [...serials, ...movies].sort(
        (a, b) =>
          new Date(b.lastInteractionAt).getTime() -
          new Date(a.lastInteractionAt).getTime(),
      ),
    [serials, movies],
  );

  const items: DisplayItem[] = recent
    .filter((m) => {
      if (filter === "series") return m.mediaType === "tv";
      if (filter === "films") return m.mediaType === "movie";
      return true;
    })
    .map((m) =>
      m.mediaType === "tv"
        ? watchedSerialToDisplayItem(m)
        : watchedMovieToDisplayItem(m),
    );

  return (
    <section>
      <SectionHeader sig="./watched" />
      <TerminalTabs
        options={FILTERS}
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
          <p className="mono text-[10px] text-accent/[0.45]">
            {profile.data.stats.filmCount} films ·{" "}
            {profile.data.stats.serialEntryCount} series watched
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
        {(data) => (
          <WatchedSection serials={data.serials} movies={data.movies} />
        )}
      </ResultSection>
    </PageFrame>
  );
}
