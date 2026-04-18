export interface ServiceError {
  code:
    | "HTTP_ERROR"
    | "RATE_LIMITED"
    | "TIMEOUT"
    | "NETWORK_ERROR"
    | "INVALID_JSON"
    | "UPSTREAM_ERROR"
    | "UNAUTHORIZED"
    | "MISSING_ENV";
  message: string;
  status?: number;
  retryable: boolean;
  details?: string;
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };

export interface JsonResponse<T> {
  status: number;
  headers: Headers;
  data: T;
}

interface JsonRequestOptions {
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function fail<T>(error: ServiceError): ServiceResult<T> {
  return { ok: false, error };
}

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export async function requestJsonWithRetry<T>(
  options: JsonRequestOptions,
): Promise<ServiceResult<JsonResponse<T>>> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const retries = options.retries ?? 1;
  const attempts = Math.max(1, retries + 1);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(options.url, {
        method: options.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const text = await response.text();
      const shouldRetry =
        RETRYABLE_STATUS.has(response.status) && attempt < attempts - 1;

      if (!response.ok && shouldRetry) {
        await delay(150 * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        return fail({
          code:
            response.status === 401
              ? "UNAUTHORIZED"
              : response.status === 429
                ? "RATE_LIMITED"
                : "HTTP_ERROR",
          message: `Upstream request failed with status ${response.status}`,
          status: response.status,
          retryable: RETRYABLE_STATUS.has(response.status),
          details: text.slice(0, 240),
        });
      }

      try {
        const payload = (text.length > 0 ? JSON.parse(text) : {}) as T;

        return ok({
          status: response.status,
          headers: response.headers,
          data: payload,
        });
      } catch (error) {
        return fail({
          code: "INVALID_JSON",
          message: "Failed to parse upstream JSON response",
          retryable: false,
          details: toErrorMessage(error),
        });
      }
    } catch (error) {
      const retryable = attempt < attempts - 1;

      if (retryable) {
        await delay(150 * (attempt + 1));
        continue;
      }

      if (isAbortError(error)) {
        return fail({
          code: "TIMEOUT",
          message: `Request timed out after ${timeoutMs}ms`,
          retryable: true,
        });
      }

      return fail({
        code: "NETWORK_ERROR",
        message: "Network request failed",
        retryable: true,
        details: toErrorMessage(error),
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return fail({
    code: "UPSTREAM_ERROR",
    message: "Request failed after retries",
    retryable: true,
  });
}
