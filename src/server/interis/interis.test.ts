import { describe, expect, it } from "vitest";
import type { RuntimeEnv } from "@/lib/env";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import {
  getCurrentlyWatchingSerials,
  getInterisData,
  getWatchedMedia,
} from "@/server/interis/interis";

const ENV: RuntimeEnv = {
  GITHUB_TOKEN: "",
  PUBLIC_GITHUB_USERNAME: "",
  LITERAL_EMAIL: "",
  LITERAL_PASSWORD: "",
  INTERIS_USERNAME: "gk",
  NASA_API_KEY: "",
};

function ctxFor(responses: CannedResponse[], calls: string[] = []) {
  return sourceCtx({ runtime: createInMemoryRuntime({ responses, calls }) });
}

const top4Item = (over: Record<string, unknown> = {}) => ({
  slot: 1,
  mediaType: "movie",
  title: "Whiplash",
  posterPath: "/whip.jpg",
  releaseYear: 2014,
  tmdbId: 244786,
  ...over,
});

const PROFILE = {
  username: "gk",
  displayUsername: "GK",
  stats: {
    filmEntryCount: 1,
    serialEntryCount: 2,
    filmCount: 3,
    reviewCount: 4,
    listCount: 5,
    followerCount: 6,
    followingCount: 7,
  },
};

describe("getInterisData", () => {
  it("splits the top4 categories into cinema / serial and attaches the profile", async () => {
    const ctx = ctxFor([
      {
        url: "/api/public/gk/top4",
        body: {
          categories: [
            { key: "cinema", supported: true, items: [top4Item({ slot: 1 })] },
            {
              key: "serial",
              supported: true,
              items: [top4Item({ slot: 2, mediaType: "serial" })],
            },
          ],
        },
      },
      { url: "/api/public/gk/profile", body: PROFILE },
    ]);

    const result = await getInterisData(ENV, ctx);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.cinema.map((i) => i.slot)).toEqual([1]);
    expect(result.data.serial.map((i) => i.slot)).toEqual([2]);
    expect(result.data.profile.username).toBe("gk");
  });

  it("falls back to an empty list for a category the payload omits", async () => {
    const ctx = ctxFor([
      {
        url: "/api/public/gk/top4",
        body: {
          categories: [
            { key: "cinema", supported: true, items: [top4Item()] },
          ],
        },
      },
      { url: "/api/public/gk/profile", body: PROFILE },
    ]);

    const result = await getInterisData(ENV, ctx);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.serial).toEqual([]);
    expect(result.data.cinema).toHaveLength(1);
  });

  it("propagates a top4 transport failure", async () => {
    const ctx = ctxFor([
      { url: "/api/public/gk/top4", status: 503, body: { down: true } },
      { url: "/api/public/gk/profile", body: PROFILE },
    ]);
    const result = await getInterisData(ENV, ctx);
    expect(result.ok).toBe(false);
  });

  it("propagates a profile transport failure", async () => {
    const ctx = ctxFor([
      {
        url: "/api/public/gk/top4",
        body: { categories: [{ key: "cinema", supported: true, items: [] }] },
      },
      { url: "/api/public/gk/profile", status: 500, body: { down: true } },
    ]);
    const result = await getInterisData(ENV, ctx);
    expect(result.ok).toBe(false);
  });

  it("short-circuits with MISSING_ENV and no network when the username is unset", async () => {
    const calls: string[] = [];
    const ctx = ctxFor([{ url: "/api/public", body: {} }], calls);
    const result = await getInterisData({ ...ENV, INTERIS_USERNAME: "" }, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("MISSING_ENV");
    expect(calls).toHaveLength(0);
  });
});

describe("getWatchedMedia", () => {
  const serial = {
    tmdbId: 7,
    title: "The Wire",
    posterPath: null,
    firstAirYear: 2002,
    numberOfSeasons: 5,
    numberOfEpisodes: 60,
    mediaType: "tv" as const,
    lastInteractionAt: "2026-01-01",
  };
  const movie = {
    tmdbId: 9,
    title: "Arrival",
    posterPath: null,
    releaseYear: 2016,
    runtime: 116,
    mediaType: "movie" as const,
    lastInteractionAt: "2026-01-02",
  };

  it("merges the watched serials and movies, threading the limit into the query", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(
      [
        { url: "/serials/watched?limit=5", body: [serial] },
        { url: "/movies/watched?limit=5", body: [movie] },
      ],
      calls,
    );

    const result = await getWatchedMedia(ENV, ctx, 5);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.serials).toEqual([serial]);
    expect(result.data.movies).toEqual([movie]);
    expect(calls.every((c) => c.includes("limit=5"))).toBe(true);
  });

  it("returns the serials failure without waiting on the movies call", async () => {
    const ctx = ctxFor([
      { url: "/serials/watched", status: 503, body: {} },
      { url: "/movies/watched", body: [movie] },
    ]);
    const result = await getWatchedMedia(ENV, ctx);
    expect(result.ok).toBe(false);
  });
});

describe("getCurrentlyWatchingSerials", () => {
  it("defaults the limit to 2 and returns the raw list", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(
      [{ url: "/serials/currently-watching", body: [{ tmdbId: 1, title: "x" }] }],
      calls,
    );
    const result = await getCurrentlyWatchingSerials(ENV, ctx);
    expect(result.ok).toBe(true);
    expect(calls[0]).toContain("currently-watching?limit=2");
  });
});
