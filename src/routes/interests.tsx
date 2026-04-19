import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
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
    return getInterisData("glory42");
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

function SectionHeader({ sig, label }: { sig: string; label: string }) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
        {sig}
      </span>
      <div className="h-px w-10 bg-gradient-to-r from-[rgba(49,116,143,0.45)] to-transparent" />
      <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.25em] text-[rgba(224,222,244,0.75)]">
        {label}
      </h2>
      <div className="h-px flex-1 bg-[rgba(64,61,82,0.8)]" />
    </div>
  );
}

function SubLabel({ label }: { label: string }) {
  return (
    <p className="mono mb-4 text-[8px] tracking-[0.2em] text-[rgba(49,116,143,0.45)] uppercase">
      {label}
    </p>
  );
}

function InterestsPageSkeleton() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(20px,2.5vh)]">
      <section>
        <header className="opacity-100">
          <div className="mb-2">
            <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
              /interests
            </span>
          </div>
          <h1 className="mono m-0 mb-[6px] text-[clamp(26px,5vw,44px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
            INTERESTS
          </h1>
        </header>

        <section className="mt-6 max-w-[680px]">
          <div className="relative animate-pulse border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.45)] px-6 py-5">
            <span className="pointer-events-none absolute left-0 top-0 h-[7px] w-[7px] border-l border-t border-[rgba(49,116,143,0.28)]" />
            <span className="pointer-events-none absolute right-0 top-0 h-[7px] w-[7px] border-r border-t border-[rgba(49,116,143,0.28)]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-[7px] w-[7px] border-b border-l border-[rgba(49,116,143,0.28)]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-[7px] w-[7px] border-b border-r border-[rgba(49,116,143,0.28)]" />
            <div className="mb-3 h-2 w-32 rounded bg-[rgba(64,61,82,0.6)]" />
            <div className="space-y-2">
              <div className="h-2.5 w-full rounded bg-[rgba(64,61,82,0.5)]" />
              <div className="h-2.5 w-11/12 rounded bg-[rgba(64,61,82,0.5)]" />
              <div className="h-2.5 w-4/5 rounded bg-[rgba(64,61,82,0.5)]" />
            </div>
          </div>
        </section>

        <section className="mb-[60px] mt-12">
          <SectionHeader sig="SIG.01" label="Favorites" />
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 animate-pulse">
            {["Favorite Bands", "Favorite Movies", "Favorite Series"].map((label) => (
              <div key={label}>
                <SubLabel label={label} />
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.5)] px-5 py-4"
                    >
                      <div className="mt-[3px] flex shrink-0 flex-col items-center gap-1">
                        <div className="h-[6px] w-[6px] rounded-full bg-[rgba(64,61,82,0.6)]" />
                        <div className="h-10 w-1 rounded bg-[rgba(64,61,82,0.4)]" />
                      </div>
                      <div className="h-[84px] w-[58px] shrink-0 bg-[rgba(64,61,82,0.5)]" />
                      <div className="min-w-0 flex-1 space-y-2 pt-[2px]">
                        <div className="h-3 w-3/4 rounded bg-[rgba(64,61,82,0.6)]" />
                        <div className="h-2 w-1/3 rounded bg-[rgba(64,61,82,0.5)]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader sig="SIG.02" label="Currently Reading" />
          <div className="flex max-w-[640px] animate-pulse flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.5)] px-5 py-4"
              >
                <div className="mt-[3px] flex shrink-0 flex-col items-center gap-1">
                  <div className="h-[6px] w-[6px] rounded-full bg-[rgba(64,61,82,0.6)]" />
                  <div className="h-10 w-1 rounded bg-[rgba(64,61,82,0.4)]" />
                </div>
                <div className="h-[84px] w-[58px] shrink-0 border border-[rgba(64,61,82,0.8)] bg-[rgba(64,61,82,0.5)]" />
                <div className="min-w-0 flex-1 space-y-2 pt-[2px]">
                  <div className="h-3 w-3/4 rounded bg-[rgba(64,61,82,0.6)]" />
                  <div className="h-2 w-1/3 rounded bg-[rgba(64,61,82,0.5)]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}

function InterestsPage() {
  const { literal: books, interis } = Route.useLoaderData();

  const seriesCount = interis.ok
    ? interis.data.profile.stats.entryCount -
      interis.data.profile.stats.filmCount
    : null;

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(20px,2.5vh)]">
      <section>
        <header className="opacity-100">
          <div className="mb-2">
            <span className="mono text-[9px] tracking-[0.25em] text-[rgba(49,116,143,0.5)]">
              /interests
            </span>
          </div>
          <h1 className="mono m-0 mb-[6px] text-[clamp(26px,5vw,44px)] font-bold tracking-[-0.01em] text-[rgb(224,222,244)]">
            INTERESTS
          </h1>
          {interis.ok && (
            <div className="mt-2 flex items-center gap-4">
              <span className="mono text-[11px] text-[rgba(144,140,170,0.7)]">
                <span className="font-semibold text-[rgb(156,207,216)]">
                  {interis.data.profile.stats.filmCount}
                </span>{" "}
                films watched
              </span>
              {seriesCount != null && seriesCount > 0 && (
                <>
                  <span className="h-[12px] w-px bg-[rgba(64,61,82,0.9)]" />
                  <span className="mono text-[11px] text-[rgba(144,140,170,0.7)]">
                    <span className="font-semibold text-[rgb(156,207,216)]">
                      {seriesCount}
                    </span>{" "}
                    series logged
                  </span>
                </>
              )}
            </div>
          )}
        </header>

        <section className="mt-6 max-w-[680px]">
          <div className="relative border border-[rgba(64,61,82,0.8)] bg-[rgba(31,29,46,0.45)] px-6 py-5">
            <span className="pointer-events-none absolute left-0 top-0 h-[7px] w-[7px] border-l border-t border-[rgba(49,116,143,0.28)]" />
            <span className="pointer-events-none absolute right-0 top-0 h-[7px] w-[7px] border-r border-t border-[rgba(49,116,143,0.28)]" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-[7px] w-[7px] border-b border-l border-[rgba(49,116,143,0.28)]" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-[7px] w-[7px] border-b border-r border-[rgba(49,116,143,0.28)]" />
            <p className="mono mb-3 text-[8px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
              // ABOUT INTERESTS
            </p>
            <p className="m-0 text-[13px] leading-[1.72] text-[rgba(144,140,170,0.9)]">
              {interestsIntro}
            </p>
          </div>
        </section>

        <section className="mb-[60px] mt-12">
          <SectionHeader sig="SIG.01" label="Favorites" />

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex flex-col gap-2">
                {favoriteBands.map((band) => (
                  <article
                    key={band.name}
                    className="book-card group relative flex items-start gap-4 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.5)] px-5 py-4"
                  >
                    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <rect className="book-trace" x="0.5" y="0.5" width="99" height="99" pathLength="100" />
                    </svg>
                    <span className="pointer-events-none absolute left-0 top-0 h-[6px] w-[6px] border-l border-t border-[rgba(196,167,231,0.2)]" />
                    <span className="pointer-events-none absolute right-0 top-0 h-[6px] w-[6px] border-r border-t border-[rgba(196,167,231,0.2)]" />
                    <span className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-[6px] border-b border-l border-[rgba(196,167,231,0.2)]" />
                    <span className="pointer-events-none absolute bottom-0 right-0 h-[6px] w-[6px] border-b border-r border-[rgba(196,167,231,0.2)]" />
                    <div className="mt-[3px] flex shrink-0 flex-col items-center gap-1">
                      <span className="inline-block h-[6px] w-[6px] rounded-full bg-[rgb(196,167,231)]" />
                      <span className="mono text-[6px] tracking-[0.08em] text-[rgba(196,167,231,0.55)] [text-orientation:mixed] [transform:rotate(180deg)] [writing-mode:vertical-rl]">
                        BAND
                      </span>
                    </div>
                    <img
                      src={band.image}
                      alt={band.name}
                      loading="lazy"
                      className="h-[84px] w-[58px] shrink-0 border border-[rgba(64,61,82,0.8)] object-cover"
                    />
                    <div className="min-w-0 flex-1 pt-[2px]">
                      <h3 className="text-[12px] font-semibold leading-[1.35] text-[rgba(224,222,244,0.9)] transition-colors duration-200 group-hover:text-[rgb(196,167,231)]">
                        {band.name}
                      </h3>
                    </div>
                    <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
                  </article>
                ))}
              </div>
            </div>

            <div>
              {books.ok ? (
                <BooksShelf books={books.data.favoriteBooks} verticalLabel="BOOK" />
              ) : (
                <ErrorPanel title="Literal API Unavailable" error={books.error} />
              )}
            </div>

            {!interis.ok ? (
              <div className="md:col-span-2">
                <ErrorPanel
                  title="Interis API Unavailable"
                  error={interis.error}
                />
              </div>
            ) : (
              <>
                <div>
                  <Top4Grid
                    items={interis.data.cinema.slice(0, 2)}
                    verticalLabel="FILM"
                  />
                </div>
                <div>
                  <Top4Grid
                    items={interis.data.serial.slice(0, 2)}
                    verticalLabel="SERIES"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <SectionHeader sig="SIG.02" label="Currently Reading" />
          {!books.ok ? (
            <ErrorPanel title="Literal API Unavailable" error={books.error} />
          ) : (
            <BooksShelf books={books.data.currentlyReading.map((rs) => rs.book)} />
          )}
        </section>
      </section>
    </PageShell>
  );
}
