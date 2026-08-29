import { describe, expect, it } from "vitest";
import { getApod, getNeoFeed } from "@/server/nasa";
import { createInMemoryRuntime, type CannedResponse } from "@/server/runtime";
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

function runtimeFor(responses: CannedResponse[], calls: string[] = []) {
  return createInMemoryRuntime({ responses, calls });
}

describe("nasa — mapping through the transport seam", () => {
  it("maps APOD and passes DEMO_KEY when NASA_API_KEY is unset", async () => {
    const calls: string[] = [];
    const runtime = runtimeFor(
      [
        {
          url: "planetary/apod",
          body: {
            title: "Pillars of Creation",
            date: today,
            explanation: "Dust and gas.",
            media_type: "image",
            url: "https://apod.nasa.gov/img.jpg",
            hdurl: "https://apod.nasa.gov/hd.jpg",
            copyright: " Someone ",
          },
        },
      ],
      calls,
    );

    const result = await getApod(ENV, runtime);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.title).toBe("Pillars of Creation");
    expect(result.data.mediaType).toBe("image");
    expect(result.data.copyright).toBe("Someone");
    expect(calls[0]).toContain("api_key=DEMO_KEY");
  });

  it("repairs a first-letter-dropped explanation from the APOD HTML page", async () => {
    const runtime = runtimeFor([
      {
        url: "planetary/apod",
        body: {
          title: "Eclipse Pair",
          date: today,
          explanation: "clipses tend to come in pairs.",
          media_type: "image",
          url: "https://apod.nasa.gov/img.jpg",
        },
      },
      {
        url: "apod.nasa.gov/apod/ap",
        body: '<b>Explanation:</b> <a href="x">E</a>clipses tend to come in pairs. <p> Bob',
      },
    ]);

    const result = await getApod(ENV, runtime);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.explanation).toBe("Eclipses tend to come in pairs.");
  });

  it("leaves a normal explanation untouched and doesn't fetch the HTML page", async () => {
    const calls: string[] = [];
    const runtime = runtimeFor(
      [
        {
          url: "planetary/apod",
          body: { title: "x", date: today, explanation: "Dust and gas.", media_type: "image" },
        },
      ],
      calls,
    );

    const result = await getApod(ENV, runtime);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.explanation).toBe("Dust and gas.");
    expect(calls.some((u) => u.includes("apod.nasa.gov/apod/ap"))).toBe(false);
  });

  it("reads today's NEO bucket and sorts by miss distance", async () => {
    const runtime = runtimeFor([
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

    const result = await getNeoFeed(ENV, runtime);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.count).toBe(2);
    expect(result.data.objects.map((o) => o.id)).toEqual(["near", "far"]);
    expect(result.data.objects[0].name).toBe("2026 NEAR");
    expect(result.data.objects[0].hazardous).toBe(true);
  });

  it("propagates a transport failure as a ServiceError", async () => {
    const runtime = runtimeFor([
      { url: "planetary/apod", status: 503, body: { error: "down" } },
    ]);
    const result = await getApod(ENV, runtime);
    expect(result.ok).toBe(false);
  });

  it("serves the second call from cache — one round-trip", async () => {
    const calls: string[] = [];
    const runtime = runtimeFor(
      [{ url: "planetary/apod", body: { title: "x", date: today, media_type: "image" } }],
      calls,
    );
    await getApod(ENV, runtime);
    await getApod(ENV, runtime);
    expect(calls).toHaveLength(1);
  });
});
