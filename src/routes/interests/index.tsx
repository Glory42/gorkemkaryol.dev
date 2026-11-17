import { createFileRoute, defer } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { BookOpen, Film, Music, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { pageHead, TerminalPrompt } from "@/components/layout/page";
import { DataSection } from "@/components/ui/DataSection";
import { SkeletonBlock, SkeletonLine } from "@/components/ui/Skeleton";
import { StatusPanel } from "@/components/ui/StatusPanel";
import { ShelfList } from "@/features/interests/components/ShelfList";
import { SmartImage } from "@/components/ui/SmartImage";
import { favoriteBands, interestsIntro } from "@/features/interests/content";
import { getReadingNow, getWatchingNow } from "@/features/interests/currently";
import {
  bookToDisplayItem,
  top4ToDisplayItem,
  watchStatsLabel,
} from "@/features/interests/display-item";
import { getInterisData } from "@/server/interis/interis";
import { getFavoriteBooks } from "@/server/literal/literal";
import { runSource } from "@/server/common/page-data";
import { SectionHeader } from "@/components/ui/SectionHeader";

const getReadingServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getReadingNow),
);

const getFavoriteBooksServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getFavoriteBooks),
);

const getInterisDataServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getInterisData),
);

const getWatchingServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getWatchingNow),
);

export const Route = createFileRoute("/interests/")({
  head: () =>
    pageHead("Interests", "Favorites and currently reading shelf from Literal.", "/interests"),
  loader: () => ({
    reading: defer(getReadingServerFn()),
    favoriteBooks: defer(getFavoriteBooksServerFn()),
    interis: defer(getInterisDataServerFn()),
    watching: defer(getWatchingServerFn()),
  }),
  component: InterestsPage,
});

function SubLabel({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="mono mb-3 flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-accent/[0.6] uppercase">
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
  const { reading, favoriteBooks, interis, watching } = Route.useLoaderData();

  return (
    <PageShell>
      <section className="mx-auto max-w-[900px]">
        <TerminalPrompt cmd="ls ./interests" className="mb-2" />

        <DataSection
          promise={interis}
          fallback={<SkeletonLine className="mb-3 h-2.5 w-40 animate-pulse" />}
          renderError={() => <div className="mb-3" />}
        >
          {(data) => (
            <p className="mono mb-3 text-[11px] text-accent/[0.6]">
              {watchStatsLabel(data.profile.stats)}
            </p>
          )}
        </DataSection>

        {interestsIntro && (
          <p className="mb-6 text-[13px] leading-[1.75] text-fg-3">
            {interestsIntro}
          </p>
        )}

        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          <div className="w-full md:w-[200px] md:shrink-0">
            <SectionHeader label="./interests/reading" more="/interests/reading" className="mb-3" />
            <DataSection
              promise={reading}
              fallback={<SectionLoading />}
              errorTitle="Literal API Unavailable"
            >
              {(items) => (
                <ShelfList
                  items={items}
                  emptyTitle="No books found"
                  emptyDescription="No books currently in progress on Literal."
                />
              )}
            </DataSection>

            <div className="mt-4">
              <SectionHeader label="./interests/watching" more="/interests/watching" className="mb-3" />
              <DataSection
                promise={watching}
                fallback={<SectionLoading />}
                errorTitle="Interis API Unavailable"
              >
                {(items) => (
                  <ShelfList
                    items={items}
                    emptyTitle="Nothing in progress"
                    emptyDescription="No serials currently being watched on Interis."
                  />
                )}
              </DataSection>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <SectionHeader label="./interests/favorites" className="mb-3" />

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
                        items={data.movie.slice(0, 2).map(top4ToDisplayItem)}
                        emptyTitle="No picks added yet"
                        emptyDescription="No top films added on Interis."
                      />
                    </div>
                    <div>
                      <SubLabel label="Series" icon={Tv} />
                      <ShelfList
                        items={data.serial.slice(0, 2).map(top4ToDisplayItem)}
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
                        <p className="text-[13px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-accent">
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
                  promise={favoriteBooks}
                  fallback={<SectionLoading />}
                  errorTitle="Literal API Unavailable"
                >
                  {(books) => (
                    <ShelfList
                      items={books.map(bookToDisplayItem)}
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
