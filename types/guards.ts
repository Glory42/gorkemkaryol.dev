export function isApiError(
  response: unknown,
): response is { error: string; repos?: unknown[]; books?: unknown[] } {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
}

export function isLiteralError(
  response: unknown,
): response is { errors: unknown[] } {
  return (
    typeof response === "object" && response !== null && "errors" in response
  );
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
