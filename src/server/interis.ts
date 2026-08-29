import { fail, ok, type ServiceResult } from "@/server/http";
import { workersRuntime, type RuntimePort } from "@/server/runtime";
import { createUpstreamClient, type UpstreamClient } from "@/server/upstream";

const BASE = "https://api.interis.gorkemkaryol.dev/api/public";

/**
 * A client scoped to one Interis account. The `INTERIS_USERNAME` check rides
 * along as the client `guard`: with no username, every call fails with
 * `MISSING_ENV` and never hits the network.
 */
function interisClient(username: string, runtime?: RuntimePort): UpstreamClient {
  return createUpstreamClient({
    base: `${BASE}/${username}`,
    defaultTtl: 900,
    timeoutMs: 8_000,
    cacheScope: `interis:${username}`,
    guard: username
      ? ok(username)
      : fail({
          code: "MISSING_ENV",
          message:
            "Missing required environment binding(s): INTERIS_USERNAME",
          retryable: false,
          details: "INTERIS_USERNAME",
        }),
    runtime: runtime ?? workersRuntime(),
  });
}

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

export async function getCurrentlyWatchingSerials(
  username: string,
  limit = 2,
  runtime?: RuntimePort,
): Promise<ServiceResult<CurrentlyWatchingSerial[]>> {
  return interisClient(username, runtime).get<CurrentlyWatchingSerial[]>(
    `/serials/currently-watching?limit=${limit}`,
    { ttl: 300 },
  );
}

export async function getWatchedMedia(
  username: string,
  limit = 200,
  runtime?: RuntimePort,
): Promise<ServiceResult<WatchedMedia>> {
  const client = interisClient(username, runtime);
  const [serials, movies] = await Promise.all([
    client.get<WatchedSerial[]>(`/serials/watched?limit=${limit}`),
    client.get<WatchedMovie[]>(`/movies/watched?limit=${limit}`),
  ]);

  if (!serials.ok) return serials;
  if (!movies.ok) return movies;
  return ok({ serials: serials.data, movies: movies.data });
}

export async function getInterisProfile(
  username: string,
  runtime?: RuntimePort,
): Promise<ServiceResult<InterisProfile>> {
  return interisClient(username, runtime).get<InterisProfile>("/profile");
}

export async function getInterisData(
  username: string,
  runtime?: RuntimePort,
): Promise<ServiceResult<InterisData>> {
  const client = interisClient(username, runtime);
  const [top4, profile] = await Promise.all([
    client.get<Top4Response>("/top4"),
    getInterisProfile(username, runtime),
  ]);

  if (!top4.ok) return top4;
  if (!profile.ok) return profile;

  const { categories } = top4.data;
  return ok({
    cinema: categories.find((c) => c.key === "cinema")?.items ?? [],
    serial: categories.find((c) => c.key === "serial")?.items ?? [],
    profile: profile.data,
  });
}
