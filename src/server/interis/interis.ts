import { requireEnv, type RuntimeEnv } from "@/lib/env";
import { envFail, ok, type ServiceResult } from "@/server/common/http";
import {
  createSourceClient,
  type SourceClient,
  type SourceCtx,
} from "@/server/common/source";

const BASE = "https://api.interis.gorkemkaryol.dev/api/public";

// A client scoped to one Interis account. No username → the `guard` fails every
// call with MISSING_ENV before any network hit.
function interisClient(env: RuntimeEnv, ctx: SourceCtx): SourceClient {
  const username = env.INTERIS_USERNAME;
  const envResult = requireEnv(env, ["INTERIS_USERNAME"]);
  return createSourceClient({
    base: `${BASE}/${username}`,
    defaultTtl: 900,
    timeoutMs: 8_000,
    scope: `interis:${username}`,
    guard: envResult.ok ? ok(envResult.data) : envFail(envResult.error),
    runtime: ctx.runtime,
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
  env: RuntimeEnv,
  ctx: SourceCtx,
  limit = 2,
): Promise<ServiceResult<CurrentlyWatchingSerial[]>> {
  return interisClient(env, ctx).get<CurrentlyWatchingSerial[]>(
    `/serials/currently-watching?limit=${limit}`,
    { ttl: 300 },
  );
}

export async function getWatchedMedia(
  env: RuntimeEnv,
  ctx: SourceCtx,
  limit = 200,
): Promise<ServiceResult<WatchedMedia>> {
  const client = interisClient(env, ctx);
  const [serials, movies] = await Promise.all([
    client.get<WatchedSerial[]>(`/serials/watched?limit=${limit}`),
    client.get<WatchedMovie[]>(`/movies/watched?limit=${limit}`),
  ]);

  if (!serials.ok) return serials;
  if (!movies.ok) return movies;
  return ok({ serials: serials.data, movies: movies.data });
}

export async function getInterisProfile(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<InterisProfile>> {
  return interisClient(env, ctx).get<InterisProfile>("/profile");
}

export async function getInterisData(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<InterisData>> {
  const client = interisClient(env, ctx);
  const [top4, profile] = await Promise.all([
    client.get<Top4Response>("/top4"),
    getInterisProfile(env, ctx),
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
