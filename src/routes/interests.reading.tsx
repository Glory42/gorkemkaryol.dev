import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env as workerEnv } from "cloudflare:workers";
import { PageShell } from "@/components/layout/PageShell";
import { BackLink } from "@/components/ui/BackLink";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { PosterGrid, PosterGridSkeleton, type PosterGridItem } from "@/components/ui/PosterGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { readRuntimeEnv } from "@/lib/env";
import { getAllBooksData, type LiteralBook } from "@/server/literal";
import { publicResult } from "@/server/http";

const getAllBooksServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const runtimeEnv = readRuntimeEnv(workerEnv);
    return publicResult(await getAllBooksData(runtimeEnv, 1000));
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
  pendingMs: 0,
  pendingComponent: ReadingPageSkeleton,
  component: ReadingPage,
});

function ReadingPageSkeleton() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pb-20 pt-[max(12px,1.5vh)]">
      <div className="mx-auto max-w-[900px]">
        <p className="mono mb-4 text-[11px] text-[#252525]">~$ cat ./interests/reading</p>
        <BackLink to="/interests">back to interests</BackLink>

        <section className="mb-10">
          <SectionHeader sig="./currently-reading" />
          <PosterGridSkeleton count={4} />
        </section>

        <section>
          <SectionHeader sig="./finished" />
          <PosterGridSkeleton count={10} />
        </section>
      </div>
    </PageShell>
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="mono text-[11px] text-[#252525]">~$ cat ./interests/reading</p>
          {result.ok && (
            <p className="mono text-[10px] text-[rgba(168,85,247,0.45)]">
              {result.data.finishedBooks.length} books read · {result.data.currentlyReading.length} reading
            </p>
          )}
        </div>

        <BackLink to="/interests">back to interests</BackLink>

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
