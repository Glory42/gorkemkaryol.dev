import { describe, expect, it } from "vitest";
import type { RuntimeEnv } from "@/lib/env";
import { getCurrently, getWatchingNow } from "@/features/interests/currently";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";

const ENV: RuntimeEnv = {
  GITHUB_TOKEN: "",
  PUBLIC_GITHUB_USERNAME: "",
  LITERAL_EMAIL: "me@example.com",
  LITERAL_PASSWORD: "pw",
  INTERIS_USERNAME: "gk",
  NASA_API_KEY: "",
};

const LITERAL: CannedResponse = {
  url: "api.literal.club/graphql",
  body: {
    data: {
      login: { token: "t", profile: { id: "p1" } },
      booksByReadingStateAndProfile: [
        { id: "1", slug: "project-hail-mary", title: "Project Hail Mary", cover: "", authors: [{ name: "Andy Weir" }] },
      ],
    },
  },
};

const show = { tmdbId: 73223, title: "Black Clover", posterPath: null, progressPercent: 40, currentEpisode: { seasonNumber: 2, episodeNumber: 8 } };
const WATCHING: CannedResponse = { url: "/serials/currently-watching", body: [show] };

const run = (responses: CannedResponse[], calls: string[] = []) =>
  sourceCtx({ runtime: createInMemoryRuntime({ responses, calls }) });

describe("getCurrently", () => {
  it("picks the newest book and show, linking where the Interests shelves do", async () => {
    const result = await getCurrently(ENV, run([LITERAL, WATCHING]));
    if (!result.ok) throw new Error("getCurrently never fails outright");
    expect(result.data.reading).toMatchObject({
      title: "Project Hail Mary",
      subtitle: "Andy Weir",
      href: "https://literal.club/book/project-hail-mary",
    });
    expect(result.data.watching).toMatchObject({
      title: "Black Clover",
      subtitle: "S2E8 next",
      href: "https://interis.gorkemkaryol.dev/serials/73223",
    });
  });

  it("keeps one side when the other upstream fails", async () => {
    const result = await getCurrently(ENV, run([WATCHING]));
    if (!result.ok) throw new Error("getCurrently never fails outright");
    expect(result.data.reading).toBeNull();
    expect(result.data.watching?.title).toBe("Black Clover");
  });

  it("asks upstream for the same limit the Interests page uses", async () => {
    const calls: string[] = [];
    await getWatchingNow(ENV, run([WATCHING], calls));
    expect(calls).toEqual([expect.stringContaining("currently-watching?limit=2")]);
  });
});
