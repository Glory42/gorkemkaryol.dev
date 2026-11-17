/// <reference types="vite/client" />
import gathinReadme from "@/features/projects/content/gathin.md?raw";
import huddinReadme from "@/features/projects/content/huddin.md?raw";

/** A private project outside the GitHub feed; `name` is its slug and `readme` the detail body. */
export interface ManualProject {
  name: string;
  description: string;
  live: string;
  language: string;
  tags: string[];
  readme: string;
  /** Your part in it; set on the ones the home page lists under `--contributed`. */
  contribution?: { where: string; role: string; summary: string };
}

export const manualProjects: ManualProject[] = [
  {
    name: "Gathin",
    description:
      "Event and community management platform built at Lodos; discovery, ticketing and payments, and a full organizer panel.",
    live: "https://gathin.com",
    language: "TypeScript",
    tags: ["Next.js", "React", "SSR"],
    readme: gathinReadme,
    contribution: {
      where: "at Lodos",
      role: "frontend contributor",
      summary:
        "Event and community platform. I work on the attendee site and organizer panel: messaging, schedules, sponsors, gallery.",
    },
  },
  {
    name: "Huddin",
    description:
      "Discord-style community platform for the Lodos ecosystem; channels, DMs, and voice/video rooms.",
    live: "https://huddin.com",
    language: "TypeScript",
    tags: ["Next.js", "LiveKit", "Socket.IO"],
    readme: huddinReadme,
  },
];

// Case-insensitive, so `/projects/gathin` resolves like the linked `/projects/Gathin`.
export function findManualProject(slug: string): ManualProject | undefined {
  const wanted = slug.toLowerCase();
  return manualProjects.find((project) => project.name.toLowerCase() === wanted);
}
