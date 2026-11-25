import { describe, expect, it } from "vitest";
import { findManualProject, manualProjects } from "@/features/projects/manual-projects";

describe("findManualProject", () => {
  it("resolves a slug by exact match", () => {
    expect(findManualProject("Gathin")?.name).toBe("Gathin");
  });

  it("resolves a slug case-insensitively", () => {
    expect(findManualProject("gathin")?.name).toBe("Gathin");
    expect(findManualProject("HUDDIN")?.name).toBe("Huddin");
  });

  it("returns undefined for an unknown slug", () => {
    expect(findManualProject("nope")).toBeUndefined();
  });

  it("carries a readme for every entry", () => {
    for (const project of manualProjects) {
      expect(project.readme.length).toBeGreaterThan(0);
    }
  });
});
