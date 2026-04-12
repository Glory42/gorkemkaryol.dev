export interface RuntimeEnv {
  PUBLIC_GITHUB_USERNAME: string;
  GITHUB_TOKEN: string;
  LITERAL_EMAIL: string;
  LITERAL_PASSWORD: string;
}

export type RuntimeEnvInput = RuntimeEnv;

type RuntimeEnvSource = Partial<Record<keyof RuntimeEnv, unknown>>;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function createRuntimeEnv(source: unknown): RuntimeEnvInput {
  const env =
    source && typeof source === "object"
      ? (source as RuntimeEnvSource)
      : ({} as RuntimeEnvSource);

  return {
    PUBLIC_GITHUB_USERNAME: asString(env.PUBLIC_GITHUB_USERNAME),
    GITHUB_TOKEN: asString(env.GITHUB_TOKEN),
    LITERAL_EMAIL: asString(env.LITERAL_EMAIL),
    LITERAL_PASSWORD: asString(env.LITERAL_PASSWORD),
  };
}

export function getGithubUsername(env: RuntimeEnvInput): string {
  return env.PUBLIC_GITHUB_USERNAME || "";
}

export function getGithubToken(env: RuntimeEnvInput): string {
  return env.GITHUB_TOKEN;
}

export function getLiteralCredentials(env: RuntimeEnvInput): {
  email: string;
  password: string;
} | null {
  const email = env.LITERAL_EMAIL;
  const password = env.LITERAL_PASSWORD;

  if (!email || !password) return null;

  return { email, password };
}

export function getRuntimeEnvPresence(env: RuntimeEnvInput): {
  hasGithubUser: boolean;
  hasGithubToken: boolean;
  hasLiteralEmail: boolean;
  hasLiteralPassword: boolean;
} {
  return {
    hasGithubUser: Boolean(getGithubUsername(env)),
    hasGithubToken: Boolean(getGithubToken(env)),
    hasLiteralEmail: Boolean(env.LITERAL_EMAIL),
    hasLiteralPassword: Boolean(env.LITERAL_PASSWORD),
  };
}

export function logRuntimeEnvPresence(
  scope: string,
  env: RuntimeEnvInput,
): void {
  console.info(`[runtime-env:${scope}]`, getRuntimeEnvPresence(env));
}
