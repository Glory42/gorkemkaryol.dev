import { createServerFn } from "@tanstack/react-start";
import { getProjects } from "@/features/projects/projects";
import { runSource } from "@/server/common/page-data";

// Project names for the command palette, fetched the first time it opens.
// Same cached source the /projects loader reads; on error the palette just
// lists pages and actions.
export const getPaletteProjectsServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const result = await runSource(getProjects);
    if (!result.ok) return [];
    return [...result.data.featured, ...result.data.contributed].map((p) => p.name);
  },
);
