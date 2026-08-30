import { describe, expect, it } from "vitest";
import { resolveApodExplanation } from "@/server/nasa/apod-explanation";
import { createInMemoryRuntime, type CannedResponse } from "@/server/common/runtime";

const DATE = "2026-08-29";
const PAGE = "apod.nasa.gov/apod/ap";

function runtimeFor(responses: CannedResponse[], calls: string[] = []) {
  return createInMemoryRuntime({ responses, calls });
}

describe("resolveApodExplanation", () => {
  it("re-reads the HTML page when the API text starts mid-word", async () => {
    const runtime = runtimeFor([
      {
        url: PAGE,
        body: '<b>Explanation:</b> <a href="x">E</a>clipses tend to come in pairs. <p> Bob',
      },
    ]);

    const fixed = await resolveApodExplanation(
      "clipses tend to come in pairs.",
      DATE,
      runtime,
    );
    expect(fixed).toBe("Eclipses tend to come in pairs.");
  });

  it("leaves a normal explanation alone and never fetches", async () => {
    const calls: string[] = [];
    const runtime = runtimeFor([], calls);

    const text = await resolveApodExplanation("Dust and gas.", DATE, runtime);
    expect(text).toBe("Dust and gas.");
    expect(calls).toHaveLength(0);
  });

  it("keeps the API text when the scrape yields nothing shorter", async () => {
    const runtime = runtimeFor([{ url: PAGE, body: "<html>no explanation here</html>" }]);
    const text = await resolveApodExplanation("clipses only.", DATE, runtime);
    expect(text).toBe("clipses only.");
  });
});
