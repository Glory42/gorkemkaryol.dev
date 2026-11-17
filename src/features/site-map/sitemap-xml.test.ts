import { describe, expect, it } from "vitest";
import { places } from "@/features/site-map/site-map";
import { renderSitemapXml, sitemapPaths } from "@/features/site-map/sitemap-xml";

describe("sitemapPaths", () => {
  it("lists every place plus one page per project, without duplicates", () => {
    const paths = sitemapPaths(["Gathin", "Gathin", "my-repo"]);
    for (const place of places) expect(paths).toContain(place.href);
    expect(paths.filter((p) => p === "/projects/Gathin")).toHaveLength(1);
    expect(paths).toContain("/projects/my-repo");
  });

  it("percent-encodes project names", () => {
    expect(sitemapPaths(["a b"])).toContain("/projects/a%20b");
  });
});

describe("renderSitemapXml", () => {
  it("writes absolute, XML-escaped locations", () => {
    const xml = renderSitemapXml(["/", "/projects/a&b"]);
    expect(xml).toContain("<loc>https://gorkemkaryol.dev/</loc>");
    expect(xml).toContain("<loc>https://gorkemkaryol.dev/projects/a&amp;b</loc>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });
});
