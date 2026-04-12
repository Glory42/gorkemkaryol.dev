const env = import.meta.env;

export function getGithubUsername(): string {
  return env.PUBLIC_GITHUB_USERNAME ?? env.NEXT_PUBLIC_GITHUB_USERNAME ?? "";
}

export function getGithubToken(): string {
  return env.GITHUB_TOKEN ?? "";
}

export function getLiteralCredentials(): {
  email: string;
  password: string;
} | null {
  const email = env.LITERAL_EMAIL;
  const password = env.LITERAL_PASSWORD;

  if (!email || !password) return null;

  return { email, password };
}
