import type { ReadingState } from "@/server/literal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  books: ReadingState[];
}

export function BooksShelf({ books }: Props) {
  if (books.length === 0) {
    return (
      <EmptyState
        title="No active reading"
        description="No books are currently marked as reading on Literal."
      />
    );
  }

  return (
    <div className="flex max-w-[640px] flex-col gap-2">
      {books.map((state) => (
        <article
          key={state.book.id}
          className="book-card group relative flex items-start gap-4 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.5)] px-5 py-4"
        >
          <span className="pointer-events-none absolute left-0 top-0 h-[6px] w-[6px] border-l border-t border-[rgba(196,167,231,0.2)]" />
          <span className="pointer-events-none absolute right-0 top-0 h-[6px] w-[6px] border-r border-t border-[rgba(196,167,231,0.2)]" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-[6px] border-b border-l border-[rgba(196,167,231,0.2)]" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-[6px] w-[6px] border-b border-r border-[rgba(196,167,231,0.2)]" />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect
              className="book-trace"
              x="0.5"
              y="0.5"
              width="99"
              height="99"
              pathLength="100"
            />
          </svg>

          <div className="mt-[3px] flex shrink-0 flex-col items-center gap-1">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-[rgb(196,167,231)]" />
            <span className="mono text-[6px] tracking-[0.08em] text-[rgba(196,167,231,0.55)] [text-orientation:mixed] [transform:rotate(180deg)] [writing-mode:vertical-rl]">
              READING
            </span>
          </div>

          <img
            src={state.book.cover}
            alt={state.book.title}
            loading="lazy"
            className="h-[84px] w-[58px] shrink-0 border border-[rgba(64,61,82,0.8)] object-cover"
          />

          <div className="min-w-0 flex-1 pt-[2px]">
            <h3 className="text-[12px] font-semibold leading-[1.35] text-[rgba(224,222,244,0.9)]">
              {state.book.title}
            </h3>
            <p className="mt-1 truncate text-[10px] tracking-[0.05em] text-[rgba(235,188,186,0.65)]">
              {state.book.authors[0]?.name ?? "Unknown"}
            </p>
          </div>
          <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
        </article>
      ))}
    </div>
  );
}
