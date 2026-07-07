import { INTERIS_BASE, TMDB_IMAGE_BASE } from "@/lib/content";
import type { CurrentlyWatchingSerial } from "@/server/interis";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  serials: CurrentlyWatchingSerial[];
}

export function WatchingShelf({ serials }: Props) {
  if (serials.length === 0) {
    return (
      <EmptyState
        title="Nothing in progress"
        description="No serials currently being watched on Interis."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {serials.map((serial, i) => (
        <div key={serial.tmdbId}>
          <a
            href={`${INTERIS_BASE}/serials/${serial.tmdbId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-3 pb-3 no-underline transition-transform hover:-translate-y-px ${i === 0 ? "" : "pt-3"}`}
          >
            {serial.posterPath ? (
              <img
                src={`${TMDB_IMAGE_BASE}${serial.posterPath}`}
                alt={serial.title}
                loading="lazy"
                width={36}
                height={52}
                className="h-[52px] w-[36px] shrink-0 object-cover"
              />
            ) : (
              <div className="h-[52px] w-[36px] shrink-0 bg-[rgba(255,255,255,0.03)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium leading-[1.3] text-[rgba(255,255,255,0.8)] transition-colors group-hover:text-[#a855f7]">
                {serial.title}
              </p>
              <p className="mt-0.5 text-[10px] text-[#444]">
                {serial.currentEpisode
                  ? `Up Next: S${serial.currentEpisode.seasonNumber}E${serial.currentEpisode.episodeNumber}`
                  : `${serial.progressPercent}% watched`}
              </p>
              <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full rounded-full bg-[rgba(168,85,247,0.45)]"
                  style={{ width: `${serial.progressPercent}%` }}
                />
              </div>
            </div>
          </a>
          {i < serials.length - 1 && (
            <div className="h-px bg-[rgba(255,255,255,0.04)]" />
          )}
        </div>
      ))}
    </div>
  );
}
