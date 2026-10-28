import { getRequest } from "@tanstack/react-start/server";
import { env as workerEnv } from "cloudflare:workers";
import { readRuntimeEnv } from "@/lib/env";
import type { ServiceResult } from "@/server/common/http";
import {
  resolveSources,
  sourceCtx,
  type Source,
} from "@/server/common/source";

// The Workers adapter for route loaders: the env binding plus the incoming
// request. The logic lives in resolveSources, which tests reach directly.

function currentRequest(): Request | null {
  try {
    return getRequest();
  } catch {
    return null;
  }
}

// Run several sources in one loader round-trip, each failing independently.
export function runSources<T extends Record<string, Source<unknown>>>(
  sources: T,
) {
  return resolveSources(
    sources,
    readRuntimeEnv(workerEnv),
    sourceCtx({ request: currentRequest() }),
  );
}

// One source for a route loader. Routes wrap this in the line createServerFn
// needs: `createServerFn({ method: "GET" }).handler(() => runSource(getX))`.
export async function runSource<T>(
  source: Source<T>,
): Promise<ServiceResult<T>> {
  return (await runSources({ only: source })).only;
}
