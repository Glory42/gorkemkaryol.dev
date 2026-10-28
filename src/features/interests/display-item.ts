import { INTERIS_BASE, TMDB_IMAGE_BASE } from "@/features/interests/content";
import type {
  CurrentlyWatchingSerial,
  InterisProfile,
  InterisTop4Item,
  WatchedMedia,
  WatchedMovie,
  WatchedSerial,
} from "@/server/interis/interis";
import type { LiteralBook } from "@/server/literal/literal";

// The one render shape behind ShelfList and PosterGrid. Sources return wire
// types; this module owns how they become shelves, ordering and labels included.
export interface DisplayItem {
  id: string | number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  href: string | null;
  progressPercent: number | null;
}

function tmdbPoster(posterPath: string | null): string | null {
  return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
}

export function bookToDisplayItem(book: LiteralBook): DisplayItem {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.authors[0]?.name ?? null,
    imageUrl: book.cover || null,
    href: `https://literal.club/book/${book.slug}`,
    progressPercent: null,
  };
}

export function currentlyWatchingToDisplayItem(
  serial: CurrentlyWatchingSerial,
): DisplayItem {
  return {
    id: serial.tmdbId,
    title: serial.title,
    subtitle: serial.currentEpisode
      ? `Up Next: S${serial.currentEpisode.seasonNumber}E${serial.currentEpisode.episodeNumber}`
      : `${serial.progressPercent}% watched`,
    imageUrl: tmdbPoster(serial.posterPath),
    href: `${INTERIS_BASE}/serials/${serial.tmdbId}`,
    progressPercent: serial.progressPercent,
  };
}

export function watchedSerialToDisplayItem(serial: WatchedSerial): DisplayItem {
  return {
    id: serial.tmdbId,
    title: serial.title,
    subtitle: serial.firstAirYear ? String(serial.firstAirYear) : null,
    imageUrl: tmdbPoster(serial.posterPath),
    href: `${INTERIS_BASE}/serials/${serial.tmdbId}`,
    progressPercent: null,
  };
}

export function watchedMovieToDisplayItem(movie: WatchedMovie): DisplayItem {
  return {
    id: movie.tmdbId,
    title: movie.title,
    subtitle: movie.releaseYear ? String(movie.releaseYear) : null,
    imageUrl: tmdbPoster(movie.posterPath),
    href: `${INTERIS_BASE}/movies/${movie.tmdbId}`,
    progressPercent: null,
  };
}

export function top4ToDisplayItem(item: InterisTop4Item): DisplayItem {
  const segment = item.mediaType === "movie" ? "movies" : "serials";
  return {
    id: item.slot,
    title: item.title,
    subtitle: item.releaseYear ? String(item.releaseYear) : null,
    imageUrl: tmdbPoster(item.posterPath),
    href: item.tmdbId ? `${INTERIS_BASE}/${segment}/${item.tmdbId}` : null,
    progressPercent: null,
  };
}

export const WATCHED_FILTERS = [
  { id: "all", label: "All" },
  { id: "series", label: "Series" },
  { id: "films", label: "Films" },
] as const;

export type WatchedFilter = (typeof WATCHED_FILTERS)[number]["id"];

// The watched shelf: series and films merged newest-first by last
// interaction, narrowed by `filter`, each row through its own adapter.
export function watchedItems(
  media: WatchedMedia,
  filter: WatchedFilter,
): DisplayItem[] {
  const entries: (WatchedSerial | WatchedMovie)[] = [
    ...(filter === "films" ? [] : media.serials),
    ...(filter === "series" ? [] : media.movies),
  ];
  return entries
    .sort(
      (a, b) =>
        new Date(b.lastInteractionAt).getTime() -
        new Date(a.lastInteractionAt).getTime(),
    )
    .map((entry) =>
      entry.mediaType === "tv"
        ? watchedSerialToDisplayItem(entry)
        : watchedMovieToDisplayItem(entry),
    );
}

export function watchStatsLabel(stats: InterisProfile["stats"]): string {
  return `${stats.movieCount} films · ${stats.serialEntryCount} series watched`;
}
