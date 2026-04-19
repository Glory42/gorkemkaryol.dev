export interface RuntimeEnv {
  GITHUB_TOKEN: string;
  PUBLIC_GITHUB_USERNAME: string;
  LITERAL_EMAIL: string;
  LITERAL_PASSWORD: string;
  INTERIS_USERNAME: string;
}

type RuntimeEnvKey = keyof RuntimeEnv;
type RuntimeEnvSource = Partial<Record<RuntimeEnvKey, unknown>>;

export interface ValidationError {
  code: "MISSING_ENV";
  message: string;
  fields: RuntimeEnvKey[];
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ValidationError };

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateFields(
  env: RuntimeEnv,
  fields: RuntimeEnvKey[],
): ValidationResult<RuntimeEnv> {
  const missing = fields.filter((field) => !env[field]);

  if (missing.length > 0) {
    return {
      ok: false,
      error: {
        code: "MISSING_ENV",
        message: `Missing required environment binding(s): ${missing.join(", ")}`,
        fields: missing,
      },
    };
  }

  return { ok: true, data: env };
}

export function readRuntimeEnv(source: unknown): RuntimeEnv {
  const env =
    source && typeof source === "object"
      ? (source as RuntimeEnvSource)
      : ({} as RuntimeEnvSource);

  return {
    GITHUB_TOKEN: asString(env.GITHUB_TOKEN),
    PUBLIC_GITHUB_USERNAME: asString(env.PUBLIC_GITHUB_USERNAME),
    LITERAL_EMAIL: asString(env.LITERAL_EMAIL),
    LITERAL_PASSWORD: asString(env.LITERAL_PASSWORD),
    INTERIS_USERNAME: asString(env.INTERIS_USERNAME),
  };
}

export function requireGithubEnv(
  env: RuntimeEnv,
): ValidationResult<
  Pick<RuntimeEnv, "GITHUB_TOKEN" | "PUBLIC_GITHUB_USERNAME">
> {
  const result = validateFields(env, [
    "GITHUB_TOKEN",
    "PUBLIC_GITHUB_USERNAME",
  ]);

  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      GITHUB_TOKEN: result.data.GITHUB_TOKEN,
      PUBLIC_GITHUB_USERNAME: result.data.PUBLIC_GITHUB_USERNAME,
    },
  };
}

export function requireLiteralEnv(
  env: RuntimeEnv,
): ValidationResult<Pick<RuntimeEnv, "LITERAL_EMAIL" | "LITERAL_PASSWORD">> {
  const result = validateFields(env, ["LITERAL_EMAIL", "LITERAL_PASSWORD"]);

  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      LITERAL_EMAIL: result.data.LITERAL_EMAIL,
      LITERAL_PASSWORD: result.data.LITERAL_PASSWORD,
    },
  };
}
