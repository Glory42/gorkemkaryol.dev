import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { BackLink } from "@/components/ui/BackLink";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { PosterGrid, PosterGridSkeleton, type PosterGridItem } from "@/components/ui/PosterGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { INTERIS_BASE, TMDB_IMAGE_BASE } from "@/lib/content";
import { readRuntimeEnv } from "@/lib/env";
import {
  getCurrentlyWatchingSerials,
  getInterisProfile,
  getWatchedMedia,
  type CurrentlyWatchingSerial,
  type WatchedMovie,
  type WatchedSerial,
} from "@/server/interis";
import { publicResult } from "@/server/http";

const getWatchingPageDataServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    const [currentlyWatching, watched, profile] = await Promise.all([
      publicResult(await getCurrentlyWatchingSerials(runtimeEnv.INTERIS_USERNAME, 30)),
      publicResult(await getWatchedMedia(runtimeEnv.INTERIS_USERNAME, 200)),
      publicResult(await getInterisProfile(runtimeEnv.INTERIS_USERNAME)),
    ]);
    return { currentlyWatching, watched, profile };
  },
);

export const Route = createFileRoute("/interests/watching")({
  head: () => ({
    meta: [
      { title: "Watching | Gorkem Karyol" },
      {
        name: "description",
        content: "Currently watching, watched series, and watched films from Interis.",
      },
    ],
  }),
  loader: async () => getWatchingPageDataServerFn(),
  pendingMs: 0,
  pendingComponent: WatchingPageSkeleton,
  component: WatchingPage,
});

function WatchingPageSkeleton() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto max-w-[900px]">
        <p className="mono mb-4 text-[11px] text-[#252525]">~$ cat ./interests/watching</p>
        <BackLink to="/interests">back to interests</BackLink>

        <section className="mb-10">
          <SectionHeader sig="./currently-watching" />
          <PosterGridSkeleton count={4} />
        </section>

        <section>
          <SectionHeader sig="./watched" />
          <PosterGridSkeleton count={10} />
        </section>
      </div>
    </PageShell>
  );
}

type Filter = "all" | "series" | "films";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "series", label: "Series" },
  { key: "films", label: "Films" },
];

function FilterTabs({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (filter: Filter) => void;
}) {
  return (
    <div className="mono mb-6 flex items-center gap-1 text-[10px] tracking-[0.1em] uppercase">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={`focus-ring cursor-pointer border px-3 py-1.5 transition-colors ${
            active === f.key
              ? "border-[rgba(168,85,247,0.5)] text-[#a855f7]"
              : "border-[rgba(255,255,255,0.06)] text-[#444] hover:text-[rgba(255,255,255,0.65)]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function toCurrentlyWatchingItem(serial: CurrentlyWatchingSerial): PosterGridItem {
  return {
    id: serial.tmdbId,
    title: serial.title,
    subtitle: serial.currentEpisode
      ? `Up Next: S${serial.currentEpisode.seasonNumber}E${serial.currentEpisode.episodeNumber}`
      : `${serial.progressPercent}% watched`,
    imageUrl: serial.posterPath ? `${TMDB_IMAGE_BASE}${serial.posterPath}` : null,
    href: `${INTERIS_BASE}/serials/${serial.tmdbId}`,
    progressPercent: serial.progressPercent,
  };
}

function toSerialItem(serial: WatchedSerial): PosterGridItem {
  return {
    id: serial.tmdbId,
    title: serial.title,
    subtitle: serial.firstAirYear ? String(serial.firstAirYear) : null,
    imageUrl: serial.posterPath ? `${TMDB_IMAGE_BASE}${serial.posterPath}` : null,
    href: `${INTERIS_BASE}/serials/${serial.tmdbId}`,
  };
}

function toMovieItem(movie: WatchedMovie): PosterGridItem {
  return {
    id: movie.tmdbId,
    title: movie.title,
    subtitle: movie.releaseYear ? String(movie.releaseYear) : null,
    imageUrl: movie.posterPath ? `${TMDB_IMAGE_BASE}${movie.posterPath}` : null,
    href: `${INTERIS_BASE}/films/${movie.tmdbId}`,
  };
}

interface WatchedEntry {
  item: PosterGridItem;
  mediaType: "tv" | "movie";
  lastInteractionAt: string;
}

function WatchedSection({
  serials,
  movies,
}: {
  serials: WatchedSerial[];
  movies: WatchedMovie[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const entries = useMemo<WatchedEntry[]>(() => {
    const combined: WatchedEntry[] = [
      ...serials.map((s) => ({
        item: toSerialItem(s),
        mediaType: "tv" as const,
        lastInteractionAt: s.lastInteractionAt,
      })),
      ...movies.map((m) => ({
        item: toMovieItem(m),
        mediaType: "movie" as const,
        lastInteractionAt: m.lastInteractionAt,
      })),
    ];
    return combined.sort(
      (a, b) =>
        new Date(b.lastInteractionAt).getTime() -
        new Date(a.lastInteractionAt).getTime(),
    );
  }, [serials, movies]);

  const filtered = entries.filter((e) => {
    if (filter === "series") return e.mediaType === "tv";
    if (filter === "films") return e.mediaType === "movie";
    return true;
  });

  return (
    <section>
      <SectionHeader sig="./watched" />
      <FilterTabs active={filter} onChange={setFilter} />
      <PosterGrid
        items={filtered.map((e) => e.item)}
        emptyTitle="Nothing here yet"
        emptyDescription="No watched titles found for this filter."
      />
    </section>
  );
}

function WatchingPage() {
  const { currentlyWatching, watched, profile } = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="mono text-[11px] text-[#252525]">~$ cat ./interests/watching</p>
          {profile.ok && (
            <p className="mono text-[10px] text-[rgba(168,85,247,0.45)]">
              {profile.data.stats.filmCount} films · {profile.data.stats.serialEntryCount} series watched
            </p>
          )}
        </div>

        <BackLink to="/interests">back to interests</BackLink>

        {currentlyWatching.ok && currentlyWatching.data.length > 0 && (
          <section className="mb-10">
            <SectionHeader sig="./currently-watching" />
            <PosterGrid
              items={currentlyWatching.data.map(toCurrentlyWatchingItem)}
              emptyTitle="Nothing in progress"
              emptyDescription="No serials currently being watched on Interis."
            />
          </section>
        )}

        {!watched.ok ? (
          <ErrorPanel title="Interis API Unavailable" error={watched.error} />
        ) : (
          <WatchedSection serials={watched.data.serials} movies={watched.data.movies} />
        )}
      </div>
    </PageShell>
  );
}
