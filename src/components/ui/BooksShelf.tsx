import type { LiteralBook } from "@/server/literal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  books: LiteralBook[];
  verticalLabel?: string;
}

export function BooksShelf({ books }: Props) {
  if (books.length === 0) {
    return (
      <EmptyState
        title="No books found"
        description="No books found in this shelf on Literal."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {books.map((book, i) => (
        <div key={book.id}>
          <a
            href={`https://literal.club/book/${book.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 py-3 no-underline transition-transform hover:-translate-y-px"
          >
            <img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className="h-[52px] w-[36px] shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-[#a855f7]">
                {book.title}
              </p>
              <p className="mt-0.5 text-[10px] text-[#444]">
                {book.authors[0]?.name ?? "Unknown"}
              </p>
            </div>
          </a>
          {i < books.length - 1 && (
            <div className="h-px bg-[rgba(255,255,255,0.04)]" />
          )}
        </div>
      ))}
    </div>
  );
}
