import { describe, expect, it } from "vitest";
import {
  bookToDisplayItem,
  currentlyWatchingToDisplayItem,
  top4ToDisplayItem,
  watchedMovieToDisplayItem,
  watchedSerialToDisplayItem,
} from "@/features/interests/display-item";
import type {
  CurrentlyWatchingSerial,
  InterisTop4Item,
  WatchedMovie,
  WatchedSerial,
} from "@/server/interis/interis";
import type { LiteralBook } from "@/server/literal/literal";

const book = (over: Partial<LiteralBook> = {}): LiteralBook => ({
  id: "b1",
  slug: "dune",
  title: "Dune",
  cover: "https://img/dune.jpg",
  authors: [{ name: "Frank Herbert" }],
  ...over,
});

describe("bookToDisplayItem", () => {
  it("maps author, cover and the literal.club href", () => {
    expect(bookToDisplayItem(book())).toEqual({
      id: "b1",
      title: "Dune",
      subtitle: "Frank Herbert",
      imageUrl: "https://img/dune.jpg",
      href: "https://literal.club/book/dune",
      progressPercent: null,
    });
  });

  it("falls back to null for a missing author and a blank cover", () => {
    const item = bookToDisplayItem(book({ authors: [], cover: "" }));
    expect(item.subtitle).toBeNull();
    expect(item.imageUrl).toBeNull();
  });
});

describe("currentlyWatchingToDisplayItem", () => {
  const base: CurrentlyWatchingSerial = {
    tmdbId: 42,
    title: "Severance",
    posterPath: "/sev.jpg",
    progressPercent: 60,
    watchedEpisodesCount: 6,
    numberOfEpisodes: 10,
    currentEpisode: { seasonNumber: 2, episodeNumber: 3, name: "x" },
  };

  it("builds the Up Next subtitle and a TMDB poster URL", () => {
    const item = currentlyWatchingToDisplayItem(base);
    expect(item.subtitle).toBe("Up Next: S2E3");
    expect(item.imageUrl).toBe("https://image.tmdb.org/t/p/w185/sev.jpg");
    expect(item.href).toBe("https://interis.gorkemkaryol.dev/serials/42");
    expect(item.progressPercent).toBe(60);
  });

  it("falls back to a percent subtitle and null poster", () => {
    const item = currentlyWatchingToDisplayItem({
      ...base,
      currentEpisode: null,
      posterPath: null,
    });
    expect(item.subtitle).toBe("60% watched");
    expect(item.imageUrl).toBeNull();
  });
});

describe("watched serial / movie", () => {
  it("maps a watched serial to its first-air year and serials href", () => {
    const serial: WatchedSerial = {
      tmdbId: 7,
      title: "The Wire",
      posterPath: "/wire.jpg",
      firstAirYear: 2002,
      numberOfSeasons: 5,
      numberOfEpisodes: 60,
      mediaType: "tv",
      lastInteractionAt: "2026-01-01",
    };
    expect(watchedSerialToDisplayItem(serial)).toMatchObject({
      subtitle: "2002",
      href: "https://interis.gorkemkaryol.dev/serials/7",
      progressPercent: null,
    });
  });

  it("maps a watched movie to its release year and films href", () => {
    const movie: WatchedMovie = {
      tmdbId: 9,
      title: "Arrival",
      posterPath: null,
      releaseYear: null,
      runtime: 116,
      mediaType: "movie",
      lastInteractionAt: "2026-01-02",
    };
    const item = watchedMovieToDisplayItem(movie);
    expect(item.subtitle).toBeNull();
    expect(item.href).toBe("https://interis.gorkemkaryol.dev/films/9");
  });
});

describe("top4ToDisplayItem", () => {
  const top = (over: Partial<InterisTop4Item> = {}): InterisTop4Item => ({
    slot: 1,
    mediaType: "movie",
    title: "Whiplash",
    posterPath: "/whip.jpg",
    releaseYear: 2014,
    tmdbId: 244786,
    ...over,
  });

  it("routes movies to /films and series to /serials", () => {
    expect(top4ToDisplayItem(top()).href).toBe(
      "https://interis.gorkemkaryol.dev/films/244786",
    );
    expect(top4ToDisplayItem(top({ mediaType: "serial" })).href).toBe(
      "https://interis.gorkemkaryol.dev/serials/244786",
    );
  });

  it("drops the href when there is no tmdbId", () => {
    expect(top4ToDisplayItem(top({ tmdbId: null })).href).toBeNull();
  });
});
