import { INTERIS_BASE, TMDB_IMAGE_BASE } from "@/features/interests/content";
import type {
  CurrentlyWatchingSerial,
  InterisTop4Item,
  WatchedMovie,
  WatchedSerial,
} from "@/server/interis/interis";
import type { LiteralBook } from "@/server/literal/literal";

// The one render shape behind ShelfList and PosterGrid. Sources keep returning
// their domain types (routes still need raw counts and sort keys); these adapt
// a single row, so the TMDB URL and the progress subtitle live in one place.
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
    href: `${INTERIS_BASE}/films/${movie.tmdbId}`,
    progressPercent: null,
  };
}

export function top4ToDisplayItem(item: InterisTop4Item): DisplayItem {
  const segment = item.mediaType === "movie" ? "films" : "serials";
  return {
    id: item.slot,
    title: item.title,
    subtitle: item.releaseYear ? String(item.releaseYear) : null,
    imageUrl: tmdbPoster(item.posterPath),
    href: item.tmdbId ? `${INTERIS_BASE}/${segment}/${item.tmdbId}` : null,
    progressPercent: null,
  };
}
