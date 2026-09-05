import type { RuntimeEnv } from "@/lib/env";
import { resolveApodExplanation } from "@/server/nasa/apod-explanation";
import { ok, type ServiceResult } from "@/server/common/http";
import { defineSource, type SourceCtx } from "@/server/common/source";

const DAY = 86_400;

function nasaKey(env: RuntimeEnv): string {
  return env.NASA_API_KEY || "DEMO_KEY";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// api.nasa.gov returns bodies that are already the payload (no envelope); the
// shared client's get() returns those as-is. The api_key query param carries the
// secret, so key the cache on a caller-supplied discriminant instead of the path.
const nasaClient = defineSource({
  envKeys: [],
  scope: () => "nasa",
  base: () => "https://api.nasa.gov",
  defaultTtl: DAY,
  timeoutMs: 10_000,
});

function nasaGet<T>(
  env: RuntimeEnv,
  ctx: SourceCtx,
  path: string,
  cacheDiscriminant: string,
): Promise<ServiceResult<T>> {
  return nasaClient(env, ctx).get<T>(path, { cacheDiscriminant });
}

// --- Astronomy Picture of the Day ---

export interface Apod {
  title: string;
  date: string;
  explanation: string;
  mediaType: "image" | "video" | "other";
  url: string;
  hdUrl: string | null;
  thumbnailUrl: string | null;
  copyright: string | null;
}

interface RawApod {
  title?: string;
  date?: string;
  explanation?: string;
  media_type?: string;
  url?: string;
  hdurl?: string;
  thumbnail_url?: string;
  copyright?: string;
}

export async function getApod(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<Apod>> {
  const key = nasaKey(env);
  const raw = await nasaGet<RawApod>(
    env,
    ctx,
    `/planetary/apod?thumbs=true&api_key=${key}`,
    `apod:${today()}`,
  );
  if (!raw.ok) return raw;

  const media = raw.data.media_type;
  const date = raw.data.date ?? today();
  return ok({
    title: raw.data.title ?? "Untitled",
    date,
    explanation: await resolveApodExplanation(
      raw.data.explanation ?? "",
      date,
      ctx.runtime,
    ),
    mediaType: media === "image" || media === "video" ? media : "other",
    url: raw.data.url ?? "",
    hdUrl: raw.data.hdurl ?? null,
    thumbnailUrl: raw.data.thumbnail_url ?? null,
    copyright: raw.data.copyright?.trim() || null,
  });
}

// --- Near-Earth objects passing close today ---

export interface NearEarthObject {
  id: string;
  name: string;
  hazardous: boolean;
  diameterMinM: number;
  diameterMaxM: number;
  missKm: number;
  missLunar: number;
  velocityKph: number;
  approachTime: string;
}

export interface NeoFeed {
  date: string;
  count: number;
  objects: NearEarthObject[];
}

interface RawNeo {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;
  estimated_diameter?: {
    meters?: { estimated_diameter_min?: number; estimated_diameter_max?: number };
  };
  close_approach_data?: Array<{
    close_approach_date_full?: string;
    relative_velocity?: { kilometers_per_hour?: string };
    miss_distance?: { kilometers?: string; lunar?: string };
  }>;
}

export async function getNeoFeed(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<NeoFeed>> {
  const key = nasaKey(env);
  const date = today();
  const raw = await nasaGet<{ near_earth_objects?: Record<string, RawNeo[]> }>(
    env,
    ctx,
    `/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${key}`,
    `neo:${date}`,
  );
  if (!raw.ok) return raw;

  const objects = (raw.data.near_earth_objects?.[date] ?? [])
    .map((n) => {
      const approach = n.close_approach_data?.[0];
      return {
        id: n.id ?? "",
        name: (n.name ?? "").replace(/^\(|\)$/g, ""),
        hazardous: Boolean(n.is_potentially_hazardous_asteroid),
        diameterMinM:
          n.estimated_diameter?.meters?.estimated_diameter_min ?? 0,
        diameterMaxM:
          n.estimated_diameter?.meters?.estimated_diameter_max ?? 0,
        missKm: Number(approach?.miss_distance?.kilometers ?? 0),
        missLunar: Number(approach?.miss_distance?.lunar ?? 0),
        velocityKph: Number(approach?.relative_velocity?.kilometers_per_hour ?? 0),
        approachTime: approach?.close_approach_date_full ?? "",
      };
    })
    .sort((a, b) => a.missKm - b.missKm);

  return ok({ date, count: objects.length, objects });
}
