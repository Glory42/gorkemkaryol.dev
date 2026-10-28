import { createServerFn } from "@tanstack/react-start";
import { getProjects } from "@/features/projects/projects";
import { runSource } from "@/server/common/page-data";

// Project names for the palette, fetched on first open from the same cached /projects source.
export const getPaletteProjectsServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const result = await runSource(getProjects);
    if (!result.ok) return [];
    return [...result.data.featured, ...result.data.contributed].map((p) => p.name);
  },
);
