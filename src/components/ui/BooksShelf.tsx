import type { LiteralBook } from "@/server/literal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";

interface Props {
  books: LiteralBook[];
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
    <div className="flex flex-col stagger">
      {books.map((book, i) => (
        <div key={book.id}>
          <a
            href={`https://literal.club/book/${book.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-3 pb-3 no-underline transition-transform hover:-translate-y-px ${i === 0 ? "" : "pt-3"}`}
          >
            {book.cover ? (
              <SmartImage
                src={book.cover}
                alt={book.title}
                loading="lazy"
                width={36}
                height={52}
                wrapperClassName="h-[52px] w-[36px] shrink-0"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-[52px] w-[36px] shrink-0 bg-[rgba(255,255,255,0.03)]" />
            )}
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
