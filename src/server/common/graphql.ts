import {
  fail,
  ok,
  requestJsonWithRetry,
  type ServiceResult,
} from "@/server/common/http";
import type { HttpPort } from "@/server/common/runtime";

// GraphQL transport: maps errors[] in a 200 body to a ServiceError once.

interface GraphQLError {
  message: string;
  /** GitHub tags errors, e.g. `"NOT_FOUND"` for a missing repository. */
  type?: string;
}

interface GraphQLEnvelope<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphqlRequestOptions {
  url: string;
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  /** Prefix for error messages, e.g. `"GitHub"` → `"GitHub GraphQL query failed"`. */
  label?: string;
  /** Transport seam, forwarded to `requestJsonWithRetry`. */
  http?: HttpPort;
  /** Observe the raw transport response (status + headers) on a successful call. */
  onMeta?: (meta: { status: number; headers: Headers }) => void;
}

function isRateLimitMessage(message: string): boolean {
  return message.toLowerCase().includes("rate limit");
}

export async function graphqlRequest<T>(
  options: GraphqlRequestOptions,
): Promise<ServiceResult<T>> {
  const label = options.label ?? "GraphQL";

  const result = await requestJsonWithRetry<GraphQLEnvelope<T>>({
    url: options.url,
    method: "POST",
    headers: options.headers,
    body: { query: options.query, variables: options.variables ?? {} },
    timeoutMs: options.timeoutMs,
    retries: options.retries,
    http: options.http,
  });

  if (!result.ok) return result;

  options.onMeta?.({ status: result.data.status, headers: result.data.headers });

  const envelope = result.data.data;
  const errors = envelope.errors ?? [];

  if (errors.length > 0 && errors.every((error) => error.type === "NOT_FOUND")) {
    return fail({
      code: "NOT_FOUND",
      message: `${label} resource not found`,
      retryable: false,
      details: errors.map((error) => error.message).join(" | "),
    });
  }

  if (errors.length > 0) {
    const rateLimited = errors.some((error) => isRateLimitMessage(error.message));
    return fail({
      code: rateLimited ? "RATE_LIMITED" : "UPSTREAM_ERROR",
      message: `${label} GraphQL query failed`,
      retryable: rateLimited,
      details: errors.map((error) => error.message).join(" | "),
    });
  }

  if (envelope.data === undefined || envelope.data === null) {
    return fail({
      code: "UPSTREAM_ERROR",
      message: `${label} response did not include data`,
      retryable: true,
    });
  }

  return ok(envelope.data);
}
