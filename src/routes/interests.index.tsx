import { Await, createFileRoute, defer, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { BookOpen, Film, Music, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { BooksShelf } from "@/components/ui/BooksShelf";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { SmartImage } from "@/components/ui/SmartImage";
import { Top4Grid } from "@/components/ui/Top4Grid";
import { WatchingShelf } from "@/components/ui/WatchingShelf";
import { favoriteBands, interestsIntro } from "@/lib/content";
import { readRuntimeEnv } from "@/lib/env";
import { getInterisData, getCurrentlyWatchingSerials } from "@/server/interis";
import { getLiteralData } from "@/server/literal";
import { publicResult } from "@/server/http";

const getLiteralDataServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return publicResult(await getLiteralData(runtimeEnv, 3));
  },
);

const getInterisDataServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return publicResult(await getInterisData(runtimeEnv.INTERIS_USERNAME));
  },
);

const getWatchingServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return publicResult(await getCurrentlyWatchingSerials(runtimeEnv.INTERIS_USERNAME, 2));
  },
);

export const Route = createFileRoute("/interests/")({
  head: () => ({
    meta: [
      { title: "Interests | Gorkem Karyol" },
      {
        name: "description",
        content: "Favorites and currently reading shelf from Literal.",
      },
    ],
  }),
  loader: () => ({
    literal: defer(getLiteralDataServerFn()),
    interis: defer(getInterisDataServerFn()),
    watching: defer(getWatchingServerFn()),
  }),
  component: InterestsPage,
});

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
        <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
          {label}
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>
      {href && (
        <Link
          to={href}
          className="mono mt-0.5 inline-block text-[9px] tracking-[0.15em] text-[rgba(168,85,247,0.45)] no-underline transition-colors hover:text-[rgba(168,85,247,0.85)]"
        >
          see all →
        </Link>
      )}
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
      <div className="image-shimmer h-[52px] w-[36px] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-3/4 rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="h-2 w-1/2 rounded bg-[rgba(255,255,255,0.03)]" />
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
        <p className="mono mb-2 text-[11px] text-[#252525]">~$ ls ./interests</p>

        <Suspense fallback={<div className="mb-3" />}>
          <Await promise={interis}>
            {(data) =>
              data.ok ? (
                <p className="mono mb-3 text-[10px] text-[rgba(168,85,247,0.45)]">
                  {data.data.profile.stats.filmCount} films · {data.data.profile.stats.serialEntryCount} series watched
                </p>
              ) : (
                <div className="mb-3" />
              )
            }
          </Await>
        </Suspense>

        {interestsIntro && (
          <p className="mb-6 text-[12px] leading-[1.75] text-[#444]">
            {interestsIntro}
          </p>
        )}

        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Left: currently reading + currently watching */}
          <div className="w-full md:w-[200px] md:shrink-0">
            <SectionLabel label="./interests/reading" href="/interests/reading" />
            <Suspense fallback={<SectionLoading />}>
              <Await promise={literal}>
                {(books) =>
                  books.ok ? (
                    <BooksShelf books={books.data.currentlyReading.slice(0, 2).map((rs) => rs.book)} />
                  ) : (
                    <ErrorPanel title="Literal API Unavailable" error={books.error} />
                  )
                }
              </Await>
            </Suspense>

            <div className="mt-8">
              <SectionLabel label="./interests/watching" href="/interests/watching" />
              <Suspense fallback={<SectionLoading />}>
                <Await promise={watching}>
                  {(data) =>
                    data.ok ? (
                      <WatchingShelf serials={data.data} />
                    ) : (
                      <ErrorPanel title="Interis API Unavailable" error={data.error} />
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>

          {/* Right: favorites */}
          <div className="min-w-0 flex-1">
            <SectionLabel label="./interests/favorites" />

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <Suspense
                fallback={
                  <>
                    <div><SubLabel label="Films" icon={Film} /><SectionLoading /></div>
                    <div><SubLabel label="Series" icon={Tv} /><SectionLoading /></div>
                  </>
                }
              >
                <Await promise={interis}>
                  {(data) =>
                    data.ok ? (
                      <>
                        <div>
                          <SubLabel label="Films" icon={Film} />
                          <Top4Grid items={data.data.cinema.slice(0, 2)} />
                        </div>
                        <div>
                          <SubLabel label="Series" icon={Tv} />
                          <Top4Grid items={data.data.serial.slice(0, 2)} />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <ErrorPanel title="Interis API Unavailable" error={data.error} />
                      </div>
                    )
                  }
                </Await>
              </Suspense>

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
                <Suspense fallback={<SectionLoading />}>
                  <Await promise={literal}>
                    {(books) =>
                      books.ok ? (
                        <BooksShelf books={books.data.favoriteBooks} />
                      ) : (
                        <ErrorPanel title="Literal API Unavailable" error={books.error} />
                      )
                    }
                  </Await>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
