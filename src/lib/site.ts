import { contactItems } from "@/features/home/content";

// Site identity for absolute URLs, social cards and structured data.
export const SITE_URL = "https://gorkemkaryol.dev";
export const SITE_NAME = "Görkem Karyol";
export const SITE_DESCRIPTION =
  "Görkem Karyol, a software engineer in Istanbul building web apps across the whole stack.";
export const OG_IMAGE = { url: `${SITE_URL}/og.png`, width: 1200, height: 630 };

/** Absolute URL for a site path (`/projects` → `https://…/projects`). */
export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

// schema.org Person, so search engines tie the site, GitHub and LinkedIn to one name.
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  alternateName: "Gorkem Karyol",
  url: `${SITE_URL}/`,
  jobTitle: "Software Engineer",
  homeLocation: { "@type": "Place", name: "Istanbul, Türkiye" },
  sameAs: contactItems
    .filter((item) => item.icon === "github" || item.icon === "linkedin")
    .map((item) => item.href),
};
