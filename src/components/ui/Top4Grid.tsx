import { INTERIS_BASE, TMDB_IMAGE_BASE } from "@/lib/content";
import type { InterisTop4Item } from "@/server/interis";

function interisUrl(item: InterisTop4Item): string | null {
  if (!item.tmdbId) return null;
  const segment = item.mediaType === "movie" ? "films" : "serials";
  return `${INTERIS_BASE}/${segment}/${item.tmdbId}`;
}

interface Props {
  items: InterisTop4Item[];
}

export function Top4Grid({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="mono text-[11px] text-[#333]">No picks added yet.</p>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const href = interisUrl(item);
        const inner = (
          <div className="flex items-center gap-3 py-3">
            {item.posterPath ? (
              <img
                src={`${TMDB_IMAGE_BASE}${item.posterPath}`}
                alt={item.title ?? ""}
                loading="lazy"
                className="h-[52px] w-[36px] shrink-0 object-cover"
              />
            ) : (
              <div className="h-[52px] w-[36px] shrink-0 bg-[rgba(255,255,255,0.03)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-[#a855f7]">
                {item.title}
              </p>
              {item.releaseYear && (
                <p className="mt-0.5 text-[10px] text-[#444]">{item.releaseYear}</p>
              )}
            </div>
          </div>
        );

        return (
          <div key={item.slot}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block no-underline transition-transform hover:-translate-y-px"
                aria-label={item.title ?? undefined}
              >
                {inner}
              </a>
            ) : (
              inner
            )}
            {i < items.length - 1 && (
              <div className="h-px bg-[rgba(255,255,255,0.04)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
