import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/http";
import { withCache } from "@/server/cache";

const BASE = "https://api.interis.gorkemkaryol.dev/api/public";

export interface InterisTop4Item {
  slot: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  tmdbId: number | null;
}

interface Top4Category {
  key: "cinema" | "serial";
  supported: boolean;
  items: InterisTop4Item[];
}

interface Top4Response {
  categories: Top4Category[];
}

export interface InterisProfile {
  username: string;
  displayUsername: string;
  stats: {
    filmEntryCount: number;
    serialEntryCount: number;
    filmCount: number;
    reviewCount: number;
    listCount: number;
    followerCount: number;
    followingCount: number;
  };
}

export interface InterisData {
  cinema: InterisTop4Item[];
  serial: InterisTop4Item[];
  profile: InterisProfile;
}

export interface CurrentlyWatchingSerial {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  progressPercent: number;
  watchedEpisodesCount: number;
  numberOfEpisodes: number;
  currentEpisode: {
    seasonNumber: number;
    episodeNumber: number;
    name: string;
  } | null;
}

export async function getCurrentlyWatchingSerials(
  username: string,
  limit = 2,
): Promise<ServiceResult<CurrentlyWatchingSerial[]>> {
  return withCache(`interis-watching-${username}-${limit}`, 300, async () => {
    const result = await requestJsonWithRetry<CurrentlyWatchingSerial[]>({
      url: `${BASE}/${username}/serials/currently-watching?limit=${limit}`,
      method: "GET",
      timeoutMs: 8_000,
    });

    if (!result.ok) return result;
    return ok(result.data.data);
  });
}

export interface WatchedSerial {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  firstAirYear: number | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  mediaType: "tv";
  lastInteractionAt: string;
}

export interface WatchedMovie {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  runtime: number | null;
  mediaType: "movie";
  lastInteractionAt: string;
}

export interface WatchedMedia {
  serials: WatchedSerial[];
  movies: WatchedMovie[];
}

export async function getWatchedMedia(
  username: string,
  limit = 200,
): Promise<ServiceResult<WatchedMedia>> {
  return withCache(`interis-watched-${username}-${limit}`, 900, async () => {
    const [serialsResult, moviesResult] = await Promise.all([
      requestJsonWithRetry<WatchedSerial[]>({
        url: `${BASE}/${username}/serials/watched?limit=${limit}`,
        method: "GET",
        timeoutMs: 8_000,
      }),
      requestJsonWithRetry<WatchedMovie[]>({
        url: `${BASE}/${username}/movies/watched?limit=${limit}`,
        method: "GET",
        timeoutMs: 8_000,
      }),
    ]);

    if (!serialsResult.ok) return serialsResult;
    if (!moviesResult.ok) return moviesResult;

    return ok({
      serials: serialsResult.data.data,
      movies: moviesResult.data.data,
    });
  });
}

export async function getInterisProfile(
  username: string,
): Promise<ServiceResult<InterisProfile>> {
  return withCache(`interis-profile-${username}`, 900, async () => {
    const result = await requestJsonWithRetry<InterisProfile>({
      url: `${BASE}/${username}/profile`,
      method: "GET",
      timeoutMs: 8_000,
    });

    if (!result.ok) return result;
    return ok(result.data.data);
  });
}

export async function getInterisData(
  username: string,
): Promise<ServiceResult<InterisData>> {
  return withCache(`interis-${username}`, 900, async () => {
    const [top4Result, profileResult] = await Promise.all([
      requestJsonWithRetry<Top4Response>({
        url: `${BASE}/${username}/top4`,
        method: "GET",
        timeoutMs: 8_000,
      }),
      requestJsonWithRetry<InterisProfile>({
        url: `${BASE}/${username}/profile`,
        method: "GET",
        timeoutMs: 8_000,
      }),
    ]);

    if (!top4Result.ok) return top4Result;
    if (!profileResult.ok) return profileResult;

    const categories = top4Result.data.data.categories;
    const cinema = categories.find((c) => c.key === "cinema")?.items ?? [];
    const serial = categories.find((c) => c.key === "serial")?.items ?? [];

    return ok({
      cinema,
      serial,
      profile: profileResult.data.data,
    });
  });
}
