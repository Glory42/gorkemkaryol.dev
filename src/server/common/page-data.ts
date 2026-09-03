import { getRequest } from "@tanstack/react-start/server";
import { env as workerEnv } from "cloudflare:workers";
import { readRuntimeEnv } from "@/lib/env";
import { publicResult, type ServiceResult } from "@/server/common/http";
import { sourceCtx, type Source } from "@/server/common/source";

function currentRequest(): Request | null {
  try {
    return getRequest();
  } catch {
    return null;
  }
}

// Run one upstream source for a route loader: read the env binding, build the
// request context, and strip internal error fields for the wire. Routes wrap
// this in the one line `createServerFn` requires:
//   createServerFn({ method: "GET" }).handler(() => runSource(getX))
export async function runSource<T>(
  source: Source<T>,
): Promise<ServiceResult<T>> {
  const env = readRuntimeEnv(workerEnv);
  const ctx = sourceCtx({ request: currentRequest() });
  return publicResult(await source(env, ctx));
}

// Run several sources against one env + ctx, each failing independently. For a
// page that folds multiple upstreams into a single loader round-trip.
export async function runSources<T extends Record<string, Source<unknown>>>(
  sources: T,
): Promise<{
  [K in keyof T]: T[K] extends Source<infer R> ? ServiceResult<R> : never;
}> {
  const env = readRuntimeEnv(workerEnv);
  const ctx = sourceCtx({ request: currentRequest() });
  const entries = await Promise.all(
    Object.entries(sources).map(
      async ([key, source]) =>
        [key, publicResult(await source(env, ctx))] as const,
    ),
  );
  return Object.fromEntries(entries) as {
    [K in keyof T]: T[K] extends Source<infer R> ? ServiceResult<R> : never;
  };
}
