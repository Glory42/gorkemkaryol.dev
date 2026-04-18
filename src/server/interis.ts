import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/http";

const BASE = "https://api.interis.gorkemkaryol.dev/api/public";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";

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
    entryCount: number;
    filmCount: number;
    reviewCount: number;
  };
}

export interface InterisData {
  cinema: InterisTop4Item[];
  serial: InterisTop4Item[];
  profile: InterisProfile;
}

export async function getInterisData(
  username: string,
): Promise<ServiceResult<InterisData>> {
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
}
