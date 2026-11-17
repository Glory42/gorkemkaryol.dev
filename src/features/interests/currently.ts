import type { RuntimeEnv } from "@/lib/env";
import { ok, type ServiceResult } from "@/server/common/http";
import type { SourceCtx } from "@/server/common/source";
import { getCurrentlyWatchingSerials } from "@/server/interis/interis";
import { getCurrentlyReading } from "@/server/literal/literal";
import {
  bookToDisplayItem,
  currentlyWatchingToDisplayItem,
  type DisplayItem,
} from "@/features/interests/display-item";

// One limit for every "currently" shelf, so home and /interests share a cache entry upstream.
const SHOWN = 2;

export async function getReadingNow(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<DisplayItem[]>> {
  const result = await getCurrentlyReading(env, ctx, SHOWN);
  return result.ok ? ok(result.data.map(bookToDisplayItem)) : result;
}

export async function getWatchingNow(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<DisplayItem[]>> {
  const result = await getCurrentlyWatchingSerials(env, ctx, SHOWN);
  return result.ok ? ok(result.data.map(currentlyWatchingToDisplayItem)) : result;
}

export interface Currently {
  reading: DisplayItem | null;
  watching: DisplayItem | null;
}

/** The newest of each, for home; a failed upstream reads as nothing rather than failing both. */
export async function getCurrently(
  env: RuntimeEnv,
  ctx: SourceCtx,
): Promise<ServiceResult<Currently>> {
  const [reading, watching] = await Promise.all([getReadingNow(env, ctx), getWatchingNow(env, ctx)]);
  return ok({
    reading: reading.ok ? (reading.data[0] ?? null) : null,
    watching: watching.ok ? (watching.data[0] ?? null) : null,
  });
}
