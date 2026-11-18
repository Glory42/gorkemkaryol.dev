import { describe, expect, it } from "vitest";
import {
  apodDisplayUrl,
  apodVideoSrc,
  cleanApodExplanation,
  getApod,
  getNeoFeed,
} from "@/server/nasa/nasa";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";
import { sourceCtx } from "@/server/common/source";
import type { RuntimeEnv } from "@/lib/env";

const ENV: RuntimeEnv = {
  GITHUB_TOKEN: "",
  PUBLIC_GITHUB_USERNAME: "",
  LITERAL_EMAIL: "",
  LITERAL_PASSWORD: "",
  INTERIS_USERNAME: "",
  NASA_API_KEY: "",
};

const today = new Date().toISOString().slice(0, 10);

function ctxFor(responses: CannedResponse[], calls: string[] = []) {
  return sourceCtx({ runtime: createInMemoryRuntime({ responses, calls }) });
}

describe("nasa — mapping through the transport seam", () => {
  it("maps today's APOD post from science.nasa.gov, no api key", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(
      [
        {
          url: "wp-json/wp/v2/apod-basic",
          body: [
            {
              title: "Rosetta&#039;s Selfie",
              date: today,
              permalink: "https://science.nasa.gov/image-article/apod-x/",
              media_type: "image",
              explanation:
                "<strong>Explanation:</strong> Dust &amp; <a href=\"x\">gas</a>.<br><br><strong>Tomorrow's picture: </strong>dark matters<br>",
              credit: "Someone",
              copyright: '<a href="https://x">Someone</a> (Club)',
              hdurl:
                "https://assets.science.nasa.gov/dynamicimage/assets/a.jpg?w=3000&#038;h=2000&#038;fit=clip",
            },
          ],
        },
      ],
      calls,
    );

    const result = await getApod(ENV, ctx);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data).toMatchObject({
      title: "Rosetta's Selfie",
      explanation: "Dust & gas.",
      mediaType: "image",
      url: "https://assets.science.nasa.gov/dynamicimage/assets/a.jpg?w=1600&fit=clip",
      hdUrl: "https://assets.science.nasa.gov/dynamicimage/assets/a.jpg?w=3000&h=2000&fit=clip",
      copyright: "Someone (Club)",
      pageUrl: "https://science.nasa.gov/image-article/apod-x/",
    });
    expect(calls[0]).not.toContain("api_key");
  });

  it("maps a video day to its player and uses the hdurl as poster", async () => {
    const ctx = ctxFor([
      {
        url: "wp-json/wp/v2/apod-basic",
        body: [
          {
            title: "Moons",
            date: today,
            permalink: "https://science.nasa.gov/image-article/apod-moons/",
            media_type: "video",
            explanation: "<strong>Explanation:</strong> Ganymede and Io.",
            basic_html:
              '<video controls><source src="https://assets.science.nasa.gov/occ.mp4" type="video/mp4"></video>',
            hdurl: "https://assets.science.nasa.gov/content/dam/occ.jpeg",
          },
        ],
      },
    ]);

    const result = await getApod(ENV, ctx);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data).toMatchObject({
      mediaType: "video",
      url: "https://assets.science.nasa.gov/occ.mp4",
      hdUrl: null,
      thumbnailUrl: "https://assets.science.nasa.gov/content/dam/occ.jpeg",
    });
  });

  it("reads today's NEO bucket and sorts by miss distance", async () => {
    const ctx = ctxFor([
      {
        url: "neo/rest/v1/feed",
        body: {
          near_earth_objects: {
            [today]: [
              {
                id: "far",
                name: "(2026 FAR)",
                is_potentially_hazardous_asteroid: false,
                estimated_diameter: {
                  meters: { estimated_diameter_min: 10, estimated_diameter_max: 20 },
                },
                close_approach_data: [
                  {
                    close_approach_date_full: "2026-Aug-29 12:00",
                    relative_velocity: { kilometers_per_hour: "40000" },
                    miss_distance: { kilometers: "9000000", lunar: "23" },
                  },
                ],
              },
              {
                id: "near",
                name: "(2026 NEAR)",
                is_potentially_hazardous_asteroid: true,
                estimated_diameter: {
                  meters: { estimated_diameter_min: 5, estimated_diameter_max: 12 },
                },
                close_approach_data: [
                  {
                    close_approach_date_full: "2026-Aug-29 06:00",
                    relative_velocity: { kilometers_per_hour: "80000" },
                    miss_distance: { kilometers: "500000", lunar: "1.3" },
                  },
                ],
              },
            ],
          },
        },
      },
    ]);

    const result = await getNeoFeed(ENV, ctx);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.count).toBe(2);
    expect(result.data.objects.map((o) => o.id)).toEqual(["near", "far"]);
    expect(result.data.objects[0].name).toBe("2026 NEAR");
    expect(result.data.objects[0].hazardous).toBe(true);
  });

  it("does not cache a failed fetch", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(
      [{ url: "apod-basic", status: 503, body: { error: "down" } }],
      calls,
    );
    const first = await getApod(ENV, ctx);
    const second = await getApod(ENV, ctx);
    expect(first.ok).toBe(false);
    expect(second.ok).toBe(false);
    // Both attempts hit the network — the failure was never stored.
    expect(calls.length).toBeGreaterThan(1);
  });

  it("serves a successful second call from cache — one round-trip", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(
      [{ url: "apod-basic", body: [{ title: "x", date: today, media_type: "image" }] }],
      calls,
    );
    await getApod(ENV, ctx);
    await getApod(ENV, ctx);
    expect(calls).toHaveLength(1);
  });

});

describe("apod helpers", () => {
  it("strips the label and the tomorrow teaser from an explanation", () => {
    expect(
      cleanApodExplanation(
        "<strong>Explanation:</strong> What a <a>flare</a>!<br><br><strong>Tomorrow’s picture:</strong> a horse",
      ),
    ).toBe("What a flare!");
  });

  it("finds a YouTube iframe on a video day", () => {
    expect(
      apodVideoSrc('<iframe width="960" src="https://www.youtube.com/embed/abc?rel=0&amp;x=1"></iframe>'),
    ).toBe("https://www.youtube.com/embed/abc?rel=0&x=1");
    expect(apodVideoSrc("<img src=x>")).toBeNull();
  });

  it("only resizes dynamicimage URLs", () => {
    const dam = "https://assets.science.nasa.gov/content/dam/a.jpg/jcr:content/renditions/x.jpeg";
    expect(apodDisplayUrl(dam)).toBe(dam);
  });
});
