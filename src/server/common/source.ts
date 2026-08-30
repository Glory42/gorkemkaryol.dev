import type { RuntimeEnv } from "@/lib/env";
import type { ServiceResult } from "@/server/common/http";
import { workersRuntime, type RuntimePort } from "@/server/common/runtime";

// An upstream source: given the env bindings and the ambient request context,
// reach one external thing and return a render-ready result.
export interface SourceCtx {
  runtime: RuntimePort;
  /** The incoming request. Only request-shaped sources (edge) read it. */
  request: Request | null;
}

export type Source<T> = (
  env: RuntimeEnv,
  ctx: SourceCtx,
) => ServiceResult<T> | Promise<ServiceResult<T>>;

// Build a ctx for direct calls and tests; defaults to the real Workers runtime.
export function sourceCtx(overrides: Partial<SourceCtx> = {}): SourceCtx {
  return {
    runtime: overrides.runtime ?? workersRuntime(),
    request: overrides.request ?? null,
  };
}
