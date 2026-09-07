import { describe, expect, it } from "vitest";
import {
  findManualProject,
  manualProjects,
} from "@/features/projects/manual-projects";

describe("findManualProject", () => {
  it("resolves a slug by exact match", () => {
    expect(findManualProject("Gathin")?.slug).toBe("Gathin");
  });

  it("resolves a slug case-insensitively", () => {
    expect(findManualProject("gathin")?.slug).toBe("Gathin");
    expect(findManualProject("HUDDIN")?.slug).toBe("Huddin");
  });

  it("returns undefined for an unknown slug", () => {
    expect(findManualProject("nope")).toBeUndefined();
  });

  it("carries a readme and a card matching the slug for every entry", () => {
    for (const project of manualProjects) {
      expect(project.readme.length).toBeGreaterThan(0);
      expect(project.card.name).toBe(project.slug);
    }
  });
});
