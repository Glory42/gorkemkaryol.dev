import { contactItems, profile } from "@/lib/profile";

export const SITE_URL = "https://gorkemkaryol.dev";
export const SITE_NAME = profile.name;
export const SITE_DESCRIPTION = `${profile.name}, a ${profile.role} in ${profile.city} building web apps end to end. Open to full-stack roles and freelance work.`;
export const OG_IMAGE = { url: `${SITE_URL}/og.png`, width: 1200, height: 630 };

export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

// schema.org Person, so search engines tie the site, GitHub and LinkedIn to one name.
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  alternateName: profile.asciiName,
  url: `${SITE_URL}/`,
  jobTitle: profile.role.replace(/(^|[\s-])\w/g, (c) => c.toUpperCase()),
  homeLocation: { "@type": "Place", name: profile.location },
  sameAs: contactItems
    .filter((item) => item.icon === "github" || item.icon === "linkedin")
    .map((item) => item.href),
};
