interface SeoInput {
  title: string;
  description: string;
  pathname: string;
}

const SITE_NAME = "Gorkem Karyol";
const SITE_URL = "https://www.gorkemkaryol.dev";

export function buildSeo({ title, description, pathname }: SeoInput) {
  const canonical = new URL(pathname, SITE_URL).toString();
  const pageTitle = pathname === "/" ? SITE_NAME : `${title} | ${SITE_NAME}`;

  return {
    title: pageTitle,
    description,
    canonical,
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      image: `${SITE_URL}/preview/previewImage.png`,
    },
  };
}
