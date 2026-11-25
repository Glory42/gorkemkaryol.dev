import type { RuntimeEnv } from "@/lib/env";
import { ok, type ServiceResult } from "@/server/common/http";
import { defineSource, type SourceCtx } from "@/server/common/source";

const DAY = 86_400;
const HOUR = 3_600;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// No envelope on api.nasa.gov; api_key rides as a query param (DEMO_KEY fallback), off cache keys.
const nasaClient = defineSource({
  envKeys: [],
  optionalEnvKeys: ["NASA_API_KEY"],
  scope: () => "nasa",
  base: () => "https://api.nasa.gov",
  query: (e) => ({ api_key: e.NASA_API_KEY || "DEMO_KEY" }),
  defaultTtl: DAY,
  timeoutMs: 10_000,
});

// APOD's own WordPress feed; api.nasa.gov/planetary/apod now returns the NASA logo instead.
const apodClient = defineSource({
  envKeys: [],
  scope: () => "nasa-apod",
  base: () => "https://science.nasa.gov/wp-json/wp/v2/apod-basic",
  defaultTtl: HOUR,
  timeoutMs: 10_000,
});

export interface Apod {
  title: string;
  date: string;
  explanation: string;
  mediaType: "image" | "video" | "other";
  url: string;
  hdUrl: string | null;
  thumbnailUrl: string | null;
  copyright: string | null;
  /** The day's science.nasa.gov article. */
  pageUrl: string;
}

interface RawApodPost {
  title?: string;
  date?: string;
  permalink?: string;
  media_type?: string;
  explanation?: string;
  credit?: string;
  copyright?: string;
  hdurl?: string;
  basic_html?: string;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? whole;
    const n =
      code[1] === "x" || code[1] === "X"
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10);
    return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
  });
}

function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

// Drop the "Explanation:" label and the trailing "Tomorrow's picture" teaser.
export function cleanApodExplanation(html: string): string {
  return htmlToText(html)
    .replace(/^Explanation:\s*/i, "")
    .replace(/\s*Tomorrow['’]s picture:[\s\S]*$/i, "")
    .trim();
}

// Video days carry the player in basic_html: a YouTube iframe or a bare <source> file.
export function apodVideoSrc(basicHtml: string): string | null {
  const match = basicHtml.match(/<(?:iframe|source)\b[^>]*\bsrc="([^"]+)"/i);
  return match ? decodeEntities(match[1]) : null;
}

// The hdurl is up to 3000px wide; dynamicimage URLs resize server-side, so ask for 1600.
export function apodDisplayUrl(hdUrl: string): string {
  try {
    const u = new URL(hdUrl);
    if (!u.pathname.startsWith("/dynamicimage/")) return hdUrl;
    u.searchParams.set("w", "1600");
    u.searchParams.delete("h");
    u.searchParams.set("fit", "clip");
    return u.toString();
  } catch {
    return hdUrl;
  }
}

export async function getApod(env: RuntimeEnv, ctx: SourceCtx): Promise<ServiceResult<Apod>> {
  // Newest post first; keyed on today so a new day's picture isn't masked by yesterday's.
  const raw = await apodClient(env, ctx).get<RawApodPost[]>("/?per_page=1", {
    cacheDiscriminant: `apod:${today()}`,
  });
  if (!raw.ok) return raw;

  const post = raw.data[0] ?? {};
  const pageUrl = post.permalink ?? "https://science.nasa.gov/apod/";
  const hd = post.hdurl ? decodeEntities(post.hdurl) : null;
  const isVideo = post.media_type === "video";
  const isImage = post.media_type === "image" && hd !== null;

  return ok({
    title: htmlToText(post.title ?? "") || "Untitled",
    date: post.date ?? today(),
    explanation: cleanApodExplanation(post.explanation ?? ""),
    mediaType: isVideo ? "video" : isImage ? "image" : "other",
    url: isVideo
      ? (apodVideoSrc(post.basic_html ?? "") ?? pageUrl)
      : hd
        ? apodDisplayUrl(hd)
        : pageUrl,
    hdUrl: isVideo ? null : hd,
    // A video day's hdurl is its poster frame.
    thumbnailUrl: isVideo ? hd : null,
    copyright: htmlToText(post.copyright || post.credit || "") || null,
    pageUrl,
  });
}

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

export async function getNeoFeed(env: RuntimeEnv, ctx: SourceCtx): Promise<ServiceResult<NeoFeed>> {
  const date = today();
  const raw = await nasaClient(env, ctx).get<{
    near_earth_objects?: Record<string, RawNeo[]>;
  }>(`/neo/rest/v1/feed?start_date=${date}&end_date=${date}`);
  if (!raw.ok) return raw;

  const objects = (raw.data.near_earth_objects?.[date] ?? [])
    .map((n) => {
      const approach = n.close_approach_data?.[0];
      return {
        id: n.id ?? "",
        name: (n.name ?? "").replace(/^\(|\)$/g, ""),
        hazardous: Boolean(n.is_potentially_hazardous_asteroid),
        diameterMinM: n.estimated_diameter?.meters?.estimated_diameter_min ?? 0,
        diameterMaxM: n.estimated_diameter?.meters?.estimated_diameter_max ?? 0,
        missKm: Number(approach?.miss_distance?.kilometers ?? 0),
        missLunar: Number(approach?.miss_distance?.lunar ?? 0),
        velocityKph: Number(approach?.relative_velocity?.kilometers_per_hour ?? 0),
        approachTime: approach?.close_approach_date_full ?? "",
      };
    })
    .sort((a, b) => a.missKm - b.missKm);

  return ok({ date, count: objects.length, objects });
}
