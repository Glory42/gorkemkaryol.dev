declare module "cloudflare:workers" {
  interface CloudflareBindings {
    GITHUB_TOKEN: string;
    PUBLIC_GITHUB_USERNAME: string;
    LITERAL_EMAIL: string;
    LITERAL_PASSWORD: string;
  }

  export const env: CloudflareBindings;
}
