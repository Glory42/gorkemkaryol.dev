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
//   createServerFn({ method: "GET" }).handler(() => loadSource(getX))
export async function loadSource<T>(
  source: Source<T>,
): Promise<ServiceResult<T>> {
  const env = readRuntimeEnv(workerEnv);
  const ctx = sourceCtx({ request: currentRequest() });
  return publicResult(await source(env, ctx));
}
