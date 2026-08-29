/// <reference types="vite/client" />
import type { GithubProject } from "@/server/github";
import gathinReadme from "@/content/projects/gathin.md?raw";

// Projects not in the GitHub feed (private company work). `card` matches
// `GithubProject` for the grid; `readme` replaces a fetched README on the detail.
export interface ManualProject {
  /** URL slug and detail-page identifier. Matches `card.name`. */
  slug: string;
  /** Live product URL — shown as the detail page's "visit site" link. */
  liveUrl: string;
  /** Markdown rendered on the detail page instead of a GitHub README. */
  readme: string;
  card: GithubProject;
}

export const manualProjects: ManualProject[] = [
  {
    slug: "Gathin",
    liveUrl: "https://gathin.com",
    readme: gathinReadme,
    card: {
      name: "Gathin",
      description:
        "Event and community management platform built at Lodos — discovery, ticketing and payments, and a full organizer panel.",
      url: "https://gathin.com",
      stargazerCount: 0,
      // `primaryLanguage` already shows TypeScript — keep the topic chips for
      // what it doesn't say.
      topics: ["Next.js", "React", "SSR"],
      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
      // Not a sort key — manual projects always lead the list (see
      // projects.index.tsx). Kept for parity with `GithubProject`.
      updatedAt: "2026-08-29T00:00:00.000Z",
    },
  },
];

export function findManualProject(slug: string): ManualProject | undefined {
  return manualProjects.find((project) => project.slug === slug);
}
