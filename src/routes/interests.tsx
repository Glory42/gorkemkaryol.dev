import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { PageShell } from "@/components/layout/PageShell";
import { BooksShelf } from "@/components/ui/BooksShelf";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { FavoriteGrid } from "@/components/ui/FavoriteGrid";
import { favorites, interestsIntro } from "@/lib/content";
import { readRuntimeEnv } from "@/lib/env";
import { getCurrentlyReading } from "@/server/literal";

const getCurrentlyReadingServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return getCurrentlyReading(runtimeEnv, 3);
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
  loader: async () => getCurrentlyReadingServerFn(),
  component: InterestsPage,
});

function InterestsPage() {
  const result = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(40px,5vh)]">
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
          <div className="mb-10 flex items-center gap-4">
            <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
              SIG.01
            </span>
            <div className="h-px w-10 bg-gradient-to-r from-[rgba(49,116,143,0.45)] to-transparent" />
            <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.25em] text-[rgba(224,222,244,0.75)]">
              Favorites
            </h2>
            <div className="h-px flex-1 bg-[rgba(64,61,82,0.8)]" />
          </div>

          <FavoriteGrid items={favorites} />
        </section>

        <section>
          <div className="mb-10 flex items-center gap-4">
            <span className="mono text-[10px] tracking-[0.2em] text-[rgba(49,116,143,0.5)]">
              SIG.02
            </span>
            <div className="h-px w-10 bg-gradient-to-r from-[rgba(49,116,143,0.45)] to-transparent" />
            <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.25em] text-[rgba(224,222,244,0.75)]">
              Currently Reading
            </h2>
            <div className="h-px flex-1 bg-[rgba(64,61,82,0.8)]" />
          </div>

          {!result.ok ? (
            <ErrorPanel title="Literal API Unavailable" error={result.error} />
          ) : (
            <BooksShelf books={result.data.books} />
          )}
        </section>
      </section>
    </PageShell>
  );
}
