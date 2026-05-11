import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { BookOpen, Film, Music, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { BooksShelf } from "@/components/ui/BooksShelf";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { Top4Grid } from "@/components/ui/Top4Grid";
import { favoriteBands, interestsIntro } from "@/lib/content";
import { readRuntimeEnv } from "@/lib/env";
import { getInterisData } from "@/server/interis";
import { getLiteralData } from "@/server/literal";

const getLiteralDataServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return getLiteralData(runtimeEnv, 3);
  },
);

const getInterisDataServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return getInterisData(runtimeEnv.INTERIS_USERNAME);
  },
);

export const Route = createFileRoute("/interests")({
  head: () => ({
    meta: [
      { title: "Interests | Gorkem Karyol" },
      {
        name: "description",
        content: "Favorites and currently reading shelf from Literal.",
      },
    ],
  }),
  loader: async () => {
    const [literal, interis] = await Promise.all([
      getLiteralDataServerFn(),
      getInterisDataServerFn(),
    ]);
    return { literal, interis };
  },
  pendingMs: 0,
  pendingComponent: InterestsPageSkeleton,
  component: InterestsPage,
});

function SectionLabel({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
          {label}
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>
      {meta && (
        <p className="mono mt-1 text-[10px] text-[rgba(168,85,247,0.75)]">{meta}</p>
      )}
    </div>
  );
}

function SubLabel({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="mono mb-3 flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-[rgba(168,85,247,0.5)] uppercase">
      <Icon size={10} />
      {label}
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-[52px] w-[36px] shrink-0 bg-[rgba(255,255,255,0.03)]" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-3/4 rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="h-2 w-1/2 rounded bg-[rgba(255,255,255,0.03)]" />
      </div>
    </div>
  );
}

function InterestsPageSkeleton() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-10 pt-[max(12px,1.5vh)]">
      <section className="mx-auto max-w-[900px] animate-pulse">
        <p className="mono mb-2 text-[11px] text-[#252525]">~$ ls ./interests</p>
        <div className="mb-5 h-2 w-24 rounded bg-[rgba(255,255,255,0.03)]" />
        <div className="mb-8 h-2 w-3/4 max-w-[480px] rounded bg-[rgba(255,255,255,0.03)]" />

        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Reading skeleton */}
          <div className="w-full md:w-[200px] md:shrink-0">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 w-16 rounded bg-[rgba(255,255,255,0.04)]" />
              <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
            </div>
            <div className="flex flex-col">
              <SkeletonItem />
              <div className="h-px bg-[rgba(255,255,255,0.04)]" />
              <SkeletonItem />
            </div>
          </div>

          {/* Favorites skeleton */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 w-20 rounded bg-[rgba(255,255,255,0.04)]" />
              <div className="h-px flex-1 bg-[rgba(255,255,255,0.04)]" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-3 h-2 w-12 rounded bg-[rgba(255,255,255,0.04)]" />
                  <div className="flex flex-col">
                    <SkeletonItem />
                    <div className="h-px bg-[rgba(255,255,255,0.04)]" />
                    <SkeletonItem />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function InterestsPage() {
  const { literal: books, interis } = Route.useLoaderData();

  const statsMeta = interis.ok
    ? `${interis.data.profile.stats.filmCount} films watched`
    : undefined;

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-10 pt-[max(12px,1.5vh)]">
      <section className="mx-auto max-w-[900px]">
        <p className="mono mb-2 text-[11px] text-[#252525]">~$ ls ./interests</p>
        {statsMeta && (
          <p className="mono mb-3 text-[10px] text-[rgba(168,85,247,0.45)]">{statsMeta}</p>
        )}
        {!statsMeta && <div className="mb-3" />}

        {interestsIntro && (
          <p className="mb-6 text-[12px] leading-[1.75] text-[#444]">
            {interestsIntro}
          </p>
        )}

        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Left: currently reading */}
          <div className="w-full md:w-[200px] md:shrink-0">
            <SectionLabel label="./interests/reading" />
            {!books.ok ? (
              <ErrorPanel title="Literal API Unavailable" error={books.error} />
            ) : (
              <BooksShelf books={books.data.currentlyReading.slice(0, 2).map((rs) => rs.book)} />
            )}
          </div>

          {/* Right: favorites */}
          <div className="min-w-0 flex-1">
            <SectionLabel label="./interests/favorites" />

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {!interis.ok ? (
                <div className="col-span-2">
                  <ErrorPanel title="Interis API Unavailable" error={interis.error} />
                </div>
              ) : (
                <>
                  <div>
                    <SubLabel label="Films" icon={Film} />
                    <Top4Grid items={interis.data.cinema.slice(0, 2)} />
                  </div>
                  <div>
                    <SubLabel label="Series" icon={Tv} />
                    <Top4Grid items={interis.data.serial.slice(0, 2)} />
                  </div>
                </>
              )}

              <div>
                <SubLabel label="Bands" icon={Music} />
                <div className="flex flex-col">
                  {favoriteBands.map((band, i) => (
                    <div key={band.name}>
                      <a
                        href={band.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 py-3 no-underline transition-transform hover:-translate-y-px"
                      >
                        <img
                          src={band.image}
                          alt={band.name}
                          loading="lazy"
                          className="h-[52px] w-[36px] shrink-0 object-cover"
                        />
                        <p className="text-[12px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-[#a855f7]">
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
                {books.ok ? (
                  <BooksShelf books={books.data.favoriteBooks} />
                ) : (
                  <ErrorPanel title="Literal API Unavailable" error={books.error} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
