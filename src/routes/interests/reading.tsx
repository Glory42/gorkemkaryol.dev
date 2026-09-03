import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/layout/PageShell";
import { PAGE_MAIN, pageHead, TerminalPrompt } from "@/components/layout/page";
import { BackLink } from "@/components/ui/BackLink";
import { ResultSection } from "@/components/ui/DataSection";
import { PosterGrid, PosterGridSkeleton, type PosterGridItem } from "@/features/interests/components/PosterGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllBooksData, type LiteralBook } from "@/server/literal/literal";
import { runSource } from "@/server/common/page-data";

const getAllBooksServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource((env, ctx) => getAllBooksData(env, ctx, 1000)),
);

export const Route = createFileRoute("/interests/reading")({
  head: () =>
    pageHead("Reading", "Currently reading and finished books from Literal."),
  loader: async () => getAllBooksServerFn(),
  pendingMs: 0,
  pendingComponent: ReadingPageSkeleton,
  component: ReadingPage,
});

function ReadingPageSkeleton() {
  return (
    <PageShell mainClassName={PAGE_MAIN}>
      <div className="mx-auto max-w-[900px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TerminalPrompt cmd="cat ./interests/reading" />
          <div className="h-2.5 w-36 animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
        </div>
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
    <PageShell mainClassName={PAGE_MAIN}>
      <div className="mx-auto max-w-[900px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TerminalPrompt cmd="cat ./interests/reading" />
          {result.ok && (
            <p className="mono text-[10px] text-accent/[0.45]">
              {result.data.finishedBooks.length} books read · {result.data.currentlyReading.length} reading
            </p>
          )}
        </div>

        <BackLink to="/interests">back to interests</BackLink>

        <ResultSection result={result} errorTitle="Literal API Unavailable">
          {(data) => (
            <>
              <section className="mb-10">
                <SectionHeader sig="./currently-reading" />
                <PosterGrid
                  items={data.currentlyReading.map(toBookItem)}
                  emptyTitle="Nothing being read"
                  emptyDescription="No books currently in progress on Literal."
                />
              </section>

              <section>
                <SectionHeader sig="./finished" />
                <PosterGrid
                  items={data.finishedBooks.map(toBookItem)}
                  emptyTitle="No finished books"
                  emptyDescription="No finished books found on Literal."
                />
              </section>
            </>
          )}
        </ResultSection>
      </div>
    </PageShell>
  );
}
