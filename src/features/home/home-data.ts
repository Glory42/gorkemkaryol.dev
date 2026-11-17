import { createServerFn } from "@tanstack/react-start";
import { getCurrently } from "@/features/interests/currently";
import { getProjects, type ProjectCard } from "@/features/projects/projects";
import { runSource } from "@/server/common/page-data";

// Home loader data; each source fails on its own so the page still renders.

export const getCurrentlyServerFn = createServerFn({ method: "GET" }).handler(() =>
  runSource(getCurrently),
);

export type ShowcaseResult = { ok: true; projects: ProjectCard[] } | { ok: false };

// Only the showcase list crosses to the client, not the whole /projects view.
export const getShowcaseServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ShowcaseResult> => {
    const result = await runSource(getProjects);
    return result.ok && !result.data.githubError
      ? { ok: true, projects: result.data.showcase }
      : { ok: false };
  },
);
