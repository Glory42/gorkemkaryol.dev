import { createServerFn } from "@tanstack/react-start";
import { getCurrently, type Currently } from "@/features/interests/currently";
import { getShowcaseProjects, type ProjectCard } from "@/features/projects/projects";
import {
  readStaleCache,
  revalidateStaleCache,
  type StaleCacheValue,
} from "@/server/common/cache";
import { ok, type ServiceResult } from "@/server/common/http";
import { runSource } from "@/server/common/page-data";
import { workersRuntime } from "@/server/common/runtime";

// Home loader data; each source fails on its own so the page still renders.
// The loader reads the last cached snapshot and the client asks for a
// revalidation after paint, so a slow upstream never holds the HTML response.
// The snapshot is only ever the cached API result, never a checked-in list.

const CURRENTLY_TTL = 300;
const SHOWCASE_TTL = 600;

export type ShowcaseResult =
  | { ok: true; projects: ProjectCard[] }
  | { ok: false };

const EMPTY_CURRENTLY: Currently = { reading: null, watching: null };
const EMPTY_SHOWCASE: ShowcaseResult = { ok: true, projects: [] };

export type Snapshot<T> = StaleCacheValue<T>;

function currentlyOptions() {
  return {
    key: "home:currently",
    ttlSeconds: CURRENTLY_TTL,
    fallback: ok(EMPTY_CURRENTLY) as ServiceResult<Currently>,
    cache: workersRuntime().cache,
  };
}

function showcaseOptions() {
  return {
    key: "home:showcase",
    ttlSeconds: SHOWCASE_TTL,
    fallback: EMPTY_SHOWCASE,
    cache: workersRuntime().cache,
  };
}

export const getCurrentlyServerFn = createServerFn({ method: "GET" }).handler(
  (): Promise<Snapshot<ServiceResult<Currently>>> =>
    readStaleCache<ServiceResult<Currently>>(currentlyOptions()),
);

// Only the showcase list crosses to the client, not the whole /projects view.
export const getShowcaseServerFn = createServerFn({ method: "GET" }).handler(
  (): Promise<Snapshot<ShowcaseResult>> =>
    readStaleCache<ShowcaseResult>(showcaseOptions()),
);

async function fetchShowcase(): Promise<ShowcaseResult> {
  const result = await runSource(getShowcaseProjects);
  return result.ok ? { ok: true, projects: result.data } : { ok: false };
}

// Called after paint when a snapshot is stale; each key revalidates on its own
// so a slow currently source never delays the showcase (or the reverse). The
// refreshed data stays in the cache for the next visit.
export const revalidateCurrentlyServerFn = createServerFn({
  method: "POST",
}).handler((): Promise<ServiceResult<Currently>> =>
  revalidateStaleCache<ServiceResult<Currently>>({
    key: "home:currently",
    ttlSeconds: CURRENTLY_TTL,
    fn: () => runSource(getCurrently),
    cache: workersRuntime().cache,
    cacheWhen: (result) => result.ok,
  }),
);

export const revalidateShowcaseServerFn = createServerFn({
  method: "POST",
}).handler((): Promise<ShowcaseResult> =>
  revalidateStaleCache<ShowcaseResult>({
    key: "home:showcase",
    ttlSeconds: SHOWCASE_TTL,
    fn: fetchShowcase,
    cache: workersRuntime().cache,
    cacheWhen: (result) => result.ok,
  }),
);
