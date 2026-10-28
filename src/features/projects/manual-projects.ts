/// <reference types="vite/client" />
import type { GithubProject } from "@/server/github/github";
import gathinReadme from "@/features/projects/content/gathin.md?raw";
import huddinReadme from "@/features/projects/content/huddin.md?raw";

// Private projects outside the GitHub feed: `card.name` is the slug, `readme` the detail body.
export interface ManualProject {
  readme: string;
  card: GithubProject;
}

export const manualProjects: ManualProject[] = [
  {
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

// Case-insensitive, so `/projects/gathin` resolves like the linked `/projects/Gathin`.
export function findManualProject(slug: string): ManualProject | undefined {
  const wanted = slug.toLowerCase();
  return manualProjects.find(
    (project) => project.card.name.toLowerCase() === wanted,
  );
}
