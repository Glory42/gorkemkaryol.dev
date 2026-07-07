import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { ChevronLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { PosterGrid, type PosterGridItem } from "@/components/ui/PosterGrid";
import { readRuntimeEnv } from "@/lib/env";
import { getAllBooksData, type LiteralBook } from "@/server/literal";
import { publicResult } from "@/server/http";

const getAllBooksServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return publicResult(await getAllBooksData(runtimeEnv, 50));
  },
);

export const Route = createFileRoute("/interests/reading")({
  head: () => ({
    meta: [
      { title: "Reading | Gorkem Karyol" },
      {
        name: "description",
        content: "Currently reading and finished books from Literal.",
      },
    ],
  }),
  loader: async () => getAllBooksServerFn(),
  component: ReadingPage,
});

function SectionHeader({ sig }: { sig: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
        {sig}
      </span>
      <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}

function toBookItem(book: LiteralBook): PosterGridItem {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.authors[0]?.name ?? null,
    imageUrl: book.cover || null,
    href: `https://literal.club/book/${book.slug}`,
  };
}

function ReadingPage() {
  const result = Route.useLoaderData();

  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto max-w-[900px]">
        <p className="mono mb-4 text-[11px] text-[#252525]">~$ cat ./interests/reading</p>

        <div className="mb-6">
          <Link
            to="/interests"
            className="focus-ring mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#333] no-underline transition-colors hover:text-[rgba(168,85,247,0.85)]"
          >
            <ChevronLeft size={11} />
            back to interests
          </Link>
        </div>

        {!result.ok ? (
          <ErrorPanel title="Literal API Unavailable" error={result.error} />
        ) : (
          <>
            <section className="mb-10">
              <SectionHeader sig="./currently-reading" />
              <PosterGrid
                items={result.data.currentlyReading.map(toBookItem)}
                emptyTitle="Nothing being read"
                emptyDescription="No books currently in progress on Literal."
              />
            </section>

            <section>
              <SectionHeader sig="./finished" />
              <PosterGrid
                items={result.data.finishedBooks.map(toBookItem)}
                emptyTitle="No finished books"
                emptyDescription="No finished books found on Literal."
              />
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}
