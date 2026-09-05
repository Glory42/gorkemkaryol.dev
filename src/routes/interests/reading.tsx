import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { pageHead } from "@/components/layout/page";
import { DataPage } from "@/components/ui/DataPage";
import { PosterGrid, PosterGridSkeleton } from "@/features/interests/components/PosterGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { bookToDisplayItem } from "@/features/interests/display-item";
import { getAllBooksData } from "@/server/literal/literal";
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

const CMD = "cat ./interests/reading";

function ReadingPageSkeleton() {
  return (
    <DataPage.Skeleton
      cmd={CMD}
      promptAside={
        <div className="h-2.5 w-36 animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
      }
      backTo="/interests"
      backLabel="back to interests"
    >
      <section className="mb-10">
        <SectionHeader sig="./currently-reading" />
        <PosterGridSkeleton count={4} />
      </section>
      <section>
        <SectionHeader sig="./finished" />
        <PosterGridSkeleton count={10} />
      </section>
    </DataPage.Skeleton>
  );
}

function ReadingPage() {
  const result = Route.useLoaderData();

  return (
    <DataPage
      cmd={CMD}
      promptAside={
        result.ok ? (
          <p className="mono text-[10px] text-accent/[0.45]">
            {result.data.finishedBooks.length} books read ·{" "}
            {result.data.currentlyReading.length} reading
          </p>
        ) : undefined
      }
      backTo="/interests"
      backLabel="back to interests"
      result={result}
      errorTitle="Literal API Unavailable"
    >
      {(data) => (
        <>
          <section className="mb-10">
            <SectionHeader sig="./currently-reading" />
            <PosterGrid
              items={data.currentlyReading.map(bookToDisplayItem)}
              emptyTitle="Nothing being read"
              emptyDescription="No books currently in progress on Literal."
            />
          </section>

          <section>
            <SectionHeader sig="./finished" />
            <PosterGrid
              items={data.finishedBooks.map(bookToDisplayItem)}
              emptyTitle="No finished books"
              emptyDescription="No finished books found on Literal."
            />
          </section>
        </>
      )}
    </DataPage>
  );
}
