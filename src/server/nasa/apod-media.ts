import type { Apod } from "@/server/nasa/nasa";

export type ApodMediaKind = "image" | "youtube" | "file" | "thumb" | "link";

export interface ApodMedia {
  kind: ApodMediaKind;
  /** What to render for `kind`: image / iframe / video / thumbnail src, or a raw link. */
  src: string;
  /** The day's science.nasa.gov article. */
  pageUrl: string;
}

// Rewrite YouTube URLs to the nocookie host our CSP allows; null for unframeable players.
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

// Some APOD "video" days are a bare file (…/occultation.mp4), not a player.
function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|$)/i.test(url);
}

// One render decision: image, then framed YouTube, video file, thumbnail, finally a link.
export function resolveApodMedia(apod: Apod): ApodMedia {
  const { pageUrl } = apod;

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
