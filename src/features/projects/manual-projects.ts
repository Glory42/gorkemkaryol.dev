/// <reference types="vite/client" />
import type { GithubProject } from "@/server/github/github";
import gathinReadme from "@/features/projects/content/gathin.md?raw";
import huddinReadme from "@/features/projects/content/huddin.md?raw";

// Projects not in the GitHub feed (private company work). `card` matches
// `GithubProject` for the grid; `readme` replaces a fetched README on the detail.
export interface ManualProject {
  slug: string;
  liveUrl: string;
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
        "Event and community management platform built at Lodos; discovery, ticketing and payments, and a full organizer panel.",
      url: "https://gathin.com",
      stargazerCount: 0,
      topics: ["Next.js", "React", "SSR"],
      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
      updatedAt: "2026-08-29T00:00:00.000Z",
    },
  },
  {
    slug: "Huddin",
    liveUrl: "https://huddin.com",
    readme: huddinReadme,
    card: {
      name: "Huddin",
      description:
        "Discord-style community platform for the Lodos ecosystem; channels, DMs, and voice/video rooms.",
      url: "https://huddin.com",
      stargazerCount: 0,
      topics: ["Next.js", "LiveKit", "Socket.IO"],
      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
      updatedAt: "2026-07-09T00:00:00.000Z",
    },
  },
];

export function findManualProject(slug: string): ManualProject | undefined {
  return manualProjects.find((project) => project.slug === slug);
}
