import { createFileRoute, defer, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { BookOpen, Film, Music, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { pageHead, TerminalPrompt } from "@/components/layout/page";
import { DataSection } from "@/components/ui/DataSection";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/Skeleton";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ShelfList, type ShelfItem } from "@/features/interests/components/ShelfList";
import { SmartImage } from "@/components/ui/SmartImage";
import { favoriteBands, interestsIntro, INTERIS_BASE, TMDB_IMAGE_BASE } from "@/features/interests/content";
import {
  getInterisData,
  getCurrentlyWatchingSerials,
  type CurrentlyWatchingSerial,
  type InterisTop4Item,
} from "@/server/interis/interis";
import { getLiteralData, type LiteralBook } from "@/server/literal/literal";
import { runSource } from "@/server/common/page-data";

const getLiteralDataServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource((env, ctx) => getLiteralData(env, ctx, 3)),
);

const getInterisDataServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getInterisData),
);

const getWatchingServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource((env, ctx) => getCurrentlyWatchingSerials(env, ctx, 2)),
);

export const Route = createFileRoute("/interests/")({
  head: () =>
    pageHead("Interests", "Favorites and currently reading shelf from Literal."),
  loader: () => ({
    literal: defer(getLiteralDataServerFn()),
    interis: defer(getInterisDataServerFn()),
    watching: defer(getWatchingServerFn()),
  }),
  component: InterestsPage,
});

function toBookShelfItem(book: LiteralBook): ShelfItem {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.authors[0]?.name ?? "Unknown",
    imageUrl: book.cover || null,
    href: `https://literal.club/book/${book.slug}`,
  };
}

function toWatchingShelfItem(serial: CurrentlyWatchingSerial): ShelfItem {
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

function toTop4ShelfItem(item: InterisTop4Item): ShelfItem {
  const segment = item.mediaType === "movie" ? "films" : "serials";
  return {
    id: item.slot,
    title: item.title,
    subtitle: item.releaseYear ? String(item.releaseYear) : null,
    imageUrl: item.posterPath ? `${TMDB_IMAGE_BASE}${item.posterPath}` : null,
    href: item.tmdbId ? `${INTERIS_BASE}/${segment}/${item.tmdbId}` : null,
  };
}

function SectionLabel({
  label,
  meta,
  href,
}: {
  label: string;
  meta?: string;
  href?: "/interests/reading" | "/interests/watching";
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-3">
        <span className="mono text-[9px] tracking-[0.25em] text-accent/[0.55] uppercase">
          {label}
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>
      {href && (
        <Link
          to={href}
          className="mono mt-0.5 inline-block text-[9px] tracking-[0.15em] text-accent/[0.45] no-underline transition-colors hover:text-accent/[0.85]"
        >
          see all →
        </Link>
      )}
      {meta && (
        <p className="mono mt-1 text-[10px] text-accent/[0.75]">{meta}</p>
      )}
    </div>
  );
}

function SubLabel({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="mono mb-3 flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-accent/[0.5] uppercase">
      <Icon size={10} />
      {label}
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="image-shimmer h-[52px] w-[36px] shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-2.5 w-3/4" />
        <SkeletonBlock className="h-2 w-1/2 rounded" />
      </div>
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="flex flex-col">
      <SkeletonItem />
      <div className="h-px bg-[rgba(255,255,255,0.04)]" />
      <SkeletonItem />
    </div>
  );
}


function InterestsPage() {
  const { literal, interis, watching } = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-10 pt-[max(12px,1.5vh)]">
      <section className="mx-auto max-w-[900px]">
        <TerminalPrompt cmd="ls ./interests" className="mb-2" />

        <DataSection
          promise={interis}
          fallback={<SkeletonLine className="mb-3 h-2.5 w-40 animate-pulse" />}
          renderError={() => <div className="mb-3" />}
        >
          {(data) => (
            <p className="mono mb-3 text-[10px] text-accent/[0.45]">
              {data.profile.stats.filmCount} films · {data.profile.stats.serialEntryCount} series watched
            </p>
          )}
        </DataSection>

        {interestsIntro && (
          <p className="mb-6 text-[12px] leading-[1.75] text-[#444]">
            {interestsIntro}
          </p>
        )}

        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Left: currently reading + currently watching */}
          <div className="w-full md:w-[200px] md:shrink-0">
            <SectionLabel label="./interests/reading" href="/interests/reading" />
            <DataSection
              promise={literal}
              fallback={<SectionLoading />}
              errorTitle="Literal API Unavailable"
            >
              {(books) => (
                <ShelfList
                  items={books.currentlyReading.slice(0, 2).map((rs) => toBookShelfItem(rs.book))}
                  emptyTitle="No books found"
                  emptyDescription="No books currently in progress on Literal."
                />
              )}
            </DataSection>

            <div className="mt-4">
              <SectionLabel label="./interests/watching" href="/interests/watching" />
              <DataSection
                promise={watching}
                fallback={<SectionLoading />}
                errorTitle="Interis API Unavailable"
              >
                {(serials) => (
                  <ShelfList
                    items={serials.map(toWatchingShelfItem)}
                    emptyTitle="Nothing in progress"
                    emptyDescription="No serials currently being watched on Interis."
                  />
                )}
              </DataSection>
            </div>
          </div>

          {/* Right: favorites */}
          <div className="min-w-0 flex-1">
            <SectionLabel label="./interests/favorites" />

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <DataSection
                promise={interis}
                fallback={
                  <>
                    <div><SubLabel label="Films" icon={Film} /><SectionLoading /></div>
                    <div><SubLabel label="Series" icon={Tv} /><SectionLoading /></div>
                  </>
                }
                renderError={(error) => (
                  <div className="col-span-2">
                    <StatusPanel tone="error" title="Interis API Unavailable" error={error} />
                  </div>
                )}
              >
                {(data) => (
                  <>
                    <div>
                      <SubLabel label="Films" icon={Film} />
                      <ShelfList
                        items={data.cinema.slice(0, 2).map(toTop4ShelfItem)}
                        emptyTitle="No picks added yet"
                        emptyDescription="No top films added on Interis."
                      />
                    </div>
                    <div>
                      <SubLabel label="Series" icon={Tv} />
                      <ShelfList
                        items={data.serial.slice(0, 2).map(toTop4ShelfItem)}
                        emptyTitle="No picks added yet"
                        emptyDescription="No top series added on Interis."
                      />
                    </div>
                  </>
                )}
              </DataSection>

              <div>
                <SubLabel label="Bands" icon={Music} />
                <div className="flex flex-col stagger">
                  {favoriteBands.map((band, i) => (
                    <div key={band.name}>
                      <a
                        href={band.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 py-3 no-underline transition-transform hover:-translate-y-px"
                      >
                        <SmartImage
                          src={band.image}
                          alt={band.name}
                          loading="lazy"
                          width={36}
                          height={52}
                          wrapperClassName="h-[52px] w-[36px] shrink-0"
                          className="h-full w-full object-cover"
                        />
                        <p className="text-[12px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-accent">
                          {band.name}
                        </p>
                      </a>
                      {i < favoriteBands.length - 1 && (
                        <div className="h-px bg-[rgba(255,255,255,0.04)]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SubLabel label="Books" icon={BookOpen} />
                <DataSection
                  promise={literal}
                  fallback={<SectionLoading />}
                  errorTitle="Literal API Unavailable"
                >
                  {(books) => (
                    <ShelfList
                      items={books.favoriteBooks.map(toBookShelfItem)}
                      emptyTitle="No books found"
                      emptyDescription="No favorite books found on Literal."
                    />
                  )}
                </DataSection>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
