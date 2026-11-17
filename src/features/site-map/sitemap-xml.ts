import { places } from "@/features/site-map/site-map";
import { absoluteUrl } from "@/lib/site";

/** Every indexable path: each page and toy, plus one detail page per project name. */
export function sitemapPaths(projectNames: string[]): string[] {
  const projects = projectNames.map(
    (name) => `/projects/${encodeURIComponent(name)}`,
  );
  return [...new Set([...places.map((place) => place.href), ...projects])];
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderSitemapXml(paths: string[]): string {
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
