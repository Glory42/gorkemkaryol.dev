import { describe, expect, it } from "vitest";
import { apodPageUrl, resolveApodMedia } from "@/server/nasa/apod-media";
import type { Apod } from "@/server/nasa/nasa";

function apod(overrides: Partial<Apod>): Apod {
  return {
    title: "t",
    date: "2026-08-29",
    explanation: "e",
    mediaType: "image",
    url: "https://apod.nasa.gov/img.jpg",
    hdUrl: null,
    thumbnailUrl: null,
    copyright: null,
    ...overrides,
  };
}

describe("apodPageUrl", () => {
  it("builds the apYYMMDD permalink", () => {
    expect(apodPageUrl("2026-08-29")).toBe(
      "https://apod.nasa.gov/apod/ap260829.html",
    );
  });
});

describe("resolveApodMedia", () => {
  it("keeps an image day an image", () => {
    const media = resolveApodMedia(
      apod({ mediaType: "image", url: "https://x/pic.jpg" }),
    );
    expect(media).toEqual({
      kind: "image",
      src: "https://x/pic.jpg",
      pageUrl: "https://apod.nasa.gov/apod/ap260829.html",
    });
  });

  it("rewrites a youtu.be video to the nocookie embed", () => {
    const media = resolveApodMedia(
      apod({ mediaType: "video", url: "https://youtu.be/abc123" }),
    );
    expect(media.kind).toBe("youtube");
    expect(media.src).toBe(
      "https://www.youtube-nocookie.com/embed/abc123?autoplay=1&mute=1&playsinline=1",
    );
  });

  it("rewrites a watch?v= video to the nocookie embed", () => {
    const media = resolveApodMedia(
      apod({ mediaType: "video", url: "https://www.youtube.com/watch?v=xyz789" }),
    );
    expect(media.kind).toBe("youtube");
    expect(media.src).toContain("/embed/xyz789");
  });

  it("passes a nocookie /embed/ URL through", () => {
    const media = resolveApodMedia(
      apod({
        mediaType: "video",
        url: "https://www.youtube-nocookie.com/embed/qqq",
      }),
    );
    expect(media.kind).toBe("youtube");
    expect(media.src).toContain("/embed/qqq");
  });

  it("treats a bare .mp4 video day as a file", () => {
    const media = resolveApodMedia(
      apod({
        mediaType: "video",
        url: "https://apod.nasa.gov/RomanLaunch_NASA.mp4",
      }),
    );
    expect(media).toMatchObject({
      kind: "file",
      src: "https://apod.nasa.gov/RomanLaunch_NASA.mp4",
    });
  });

  it("falls back to a thumbnail for an unframeable player", () => {
    const media = resolveApodMedia(
      apod({
        mediaType: "video",
        url: "https://vimeo.com/12345",
        thumbnailUrl: "https://x/thumb.jpg",
      }),
    );
    expect(media).toMatchObject({ kind: "thumb", src: "https://x/thumb.jpg" });
  });

  it("falls back to a bare link when there is no thumbnail", () => {
    const media = resolveApodMedia(
      apod({ mediaType: "video", url: "https://vimeo.com/12345" }),
    );
    expect(media).toMatchObject({ kind: "link", src: "https://vimeo.com/12345" });
  });

  it("uses a thumbnail for a mediaType 'other' day when present", () => {
    const media = resolveApodMedia(
      apod({
        mediaType: "other",
        url: "https://x/weird",
        thumbnailUrl: "https://x/t.jpg",
      }),
    );
    expect(media.kind).toBe("thumb");
  });
});
