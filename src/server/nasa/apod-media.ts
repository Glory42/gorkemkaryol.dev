import type { Apod } from "@/server/nasa/nasa";

export type ApodMediaKind = "image" | "youtube" | "file" | "thumb" | "link";

export interface ApodMedia {
  kind: ApodMediaKind;
  /** What to render for `kind`: image / iframe / video / thumbnail src, or a raw link. */
  src: string;
  /** The apod.nasa.gov permalink for the day. */
  pageUrl: string;
}

// The apod.nasa.gov permalink for a YYYY-MM-DD, e.g. 2026-08-29 -> ap260829.html
export function apodPageUrl(date: string): string {
  return `https://apod.nasa.gov/apod/ap${date.slice(2).replace(/-/g, "")}.html`;
}

// APOD video days hand us a YouTube URL; rewrite it to the nocookie embed host
// our CSP frame-src allows. Returns null for players we can't frame (Vimeo etc).
function youtubeEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    const id =
      host === "youtu.be"
        ? u.pathname.slice(1)
        : host === "youtube.com" || host === "youtube-nocookie.com"
          ? u.pathname.startsWith("/embed/")
            ? u.pathname.slice(7)
            : u.searchParams.get("v")
          : null;
    return id
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1`
      : null;
  } catch {
    return null;
  }
}

// Some APOD "video" days are a bare file (…/RomanLaunch_NASA.mp4), not a player.
function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|$)/i.test(url);
}

// Collapse APOD's coarse `mediaType` and the messy URL into one render decision.
// Precedence: image -> framed YouTube -> direct video file -> thumbnail -> link.
export function resolveApodMedia(apod: Apod): ApodMedia {
  const pageUrl = apodPageUrl(apod.date);

  if (apod.mediaType === "image") {
    return { kind: "image", src: apod.url, pageUrl };
  }

  if (apod.mediaType === "video") {
    const embed = youtubeEmbedUrl(apod.url);
    if (embed) return { kind: "youtube", src: embed, pageUrl };
    if (isDirectVideo(apod.url)) return { kind: "file", src: apod.url, pageUrl };
  }

  if (apod.thumbnailUrl) {
    return { kind: "thumb", src: apod.thumbnailUrl, pageUrl };
  }

  return { kind: "link", src: apod.url, pageUrl };
}
