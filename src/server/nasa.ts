import type { RuntimeEnv } from "@/lib/env";
import { ok, requestJsonWithRetry, type ServiceResult } from "@/server/http";
import { workersRuntime, type RuntimePort } from "@/server/runtime";

// api.nasa.gov returns bare JSON (no `{ data }` envelope), so this module talks
// to the transport + cache seams directly instead of reusing the upstream client.

const BASE = "https://api.nasa.gov";
const DAY = 86_400;

function nasaKey(env: RuntimeEnv): string {
  return env.NASA_API_KEY || "DEMO_KEY";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Read-through cache that only stores successes, so a transient upstream error
// isn't pinned for a whole day.
async function nasaGet<T>(
  path: string,
  cacheKey: string,
  runtime: RuntimePort,
): Promise<ServiceResult<T>> {
  const key = `nasa:${cacheKey}`;
  const hit = await runtime.cache.get<ServiceResult<T>>(key);
  if (hit !== undefined) return hit;

  const res = await requestJsonWithRetry<T>({
    url: `${BASE}${path}`,
    method: "GET",
    timeoutMs: 10_000,
    retries: 1,
    http: runtime.http,
  });
  const result: ServiceResult<T> = res.ok ? ok(res.data.data) : res;
  if (result.ok) await runtime.cache.set(key, result, DAY);
  return result;
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

// The APOD API drops a word's first letter when the source HTML hyperlinks it
// ("Eclipses" -> "clipses"). On that signature, re-read the text from the page.
async function repairExplanation(
  raw: string,
  date: string,
  runtime: RuntimePort,
): Promise<string> {
  if (!raw || !/^[a-z]/.test(raw)) return raw;

  const key = `nasa:apod-expl:${date}`;
  const hit = await runtime.cache.get<string>(key);
  if (hit !== undefined) return hit;

  try {
    const stamp = date.slice(2).replace(/-/g, "");
    const res = await runtime.http.fetch(
      `https://apod.nasa.gov/apod/ap${stamp}.html`,
    );
    if (res.ok) {
      const match = (await res.text()).match(
        /Explanation:\s*<\/b>\s*([\s\S]*?)\s*<p>/i,
      );
      const text = match?.[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      // Only cache a real repair; on failure fall through and retry next call.
      if (text && text.length >= raw.length) {
        await runtime.cache.set(key, text, DAY);
        return text;
      }
    }
  } catch {
    // Keep the API's text as-is on any failure.
  }
  return raw;
}

export async function getApod(
  env: RuntimeEnv,
  runtime: RuntimePort = workersRuntime(),
): Promise<ServiceResult<Apod>> {
  const key = nasaKey(env);
  const raw = await nasaGet<RawApod>(
    `/planetary/apod?thumbs=true&api_key=${key}`,
    `apod:${today()}`,
    runtime,
  );
  if (!raw.ok) return raw;

  const media = raw.data.media_type;
  const date = raw.data.date ?? today();
  return ok({
    title: raw.data.title ?? "Untitled",
    date,
    explanation: await repairExplanation(
      raw.data.explanation ?? "",
      date,
      runtime,
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
  runtime: RuntimePort = workersRuntime(),
): Promise<ServiceResult<NeoFeed>> {
  const key = nasaKey(env);
  const date = today();
  const raw = await nasaGet<{
    near_earth_objects?: Record<string, RawNeo[]>;
  }>(
    `/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${key}`,
    `neo:${date}`,
    runtime,
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
