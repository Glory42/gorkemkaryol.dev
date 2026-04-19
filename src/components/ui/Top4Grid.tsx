import { INTERIS_BASE, TMDB_IMAGE_BASE } from "@/lib/content";
import type { InterisTop4Item } from "@/server/interis";

function interisUrl(item: InterisTop4Item): string | null {
  if (!item.tmdbId) return null;
  const segment = item.mediaType === "movie" ? "films" : "serials";
  return `${INTERIS_BASE}/${segment}/${item.tmdbId}`;
}

interface Props {
  items: InterisTop4Item[];
  verticalLabel: string;
}

export function Top4Grid({ items, verticalLabel }: Props) {
  if (items.length === 0) {
    return (
      <p className="mono text-[11px] text-[rgba(110,106,134,0.6)]">
        No picks added yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const href = interisUrl(item);
        return (
          <article
            key={item.slot}
            className="book-card group relative flex items-start gap-4 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.5)] px-5 py-4"
          >
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10"
                aria-label={item.title ?? undefined}
              />
            )}
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
                {verticalLabel}
              </span>
            </div>

            {item.posterPath ? (
              <img
                src={`${TMDB_IMAGE_BASE}${item.posterPath}`}
                alt={item.title}
                loading="lazy"
                className="h-[84px] w-[58px] shrink-0 border border-[rgba(64,61,82,0.8)] object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
            ) : (
              <div className="h-[84px] w-[58px] shrink-0 border border-[rgba(64,61,82,0.8)] bg-[rgba(64,61,82,0.5)]" />
            )}

            <div className="min-w-0 flex-1 pt-[2px]">
              <h3 className="text-[12px] font-semibold leading-[1.35] text-[rgba(224,222,244,0.9)] transition-colors duration-200 group-hover:text-[rgb(196,167,231)]">
                {item.title}
              </h3>
              {item.releaseYear && (
                <p className="mt-1 text-[10px] tracking-[0.05em] text-[rgba(235,188,186,0.65)]">
                  {item.releaseYear}
                </p>
              )}
            </div>

            <span className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-[rgb(196,167,231)] transition-transform duration-200 group-hover:scale-x-100" />
          </article>
        );
      })}
    </div>
  );
}
