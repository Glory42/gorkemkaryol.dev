import { describe, expect, it } from "vitest";
import { getApod, getNeoFeed } from "@/server/nasa/nasa";
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
  it("maps APOD and passes DEMO_KEY when NASA_API_KEY is unset", async () => {
    const calls: string[] = [];
    const ctx = ctxFor(
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

    const result = await getApod(ENV, ctx);
    if (!result.ok) throw new Error("expected ok");
    expect(result.data.title).toBe("Pillars of Creation");
    expect(result.data.mediaType).toBe("image");
    expect(result.data.copyright).toBe("Someone");
    expect(calls[0]).toContain("api_key=DEMO_KEY");
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
      [{ url: "planetary/apod", status: 503, body: { error: "down" } }],
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
      [{ url: "planetary/apod", body: { title: "x", date: today, media_type: "image" } }],
      calls,
    );
    await getApod(ENV, ctx);
    await getApod(ENV, ctx);
    expect(calls).toHaveLength(1);
  });
});
