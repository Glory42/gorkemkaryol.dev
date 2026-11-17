import { createFileRoute } from "@tanstack/react-router";
import { getProjects } from "@/features/projects/projects";
import { renderSitemapXml, sitemapPaths } from "@/features/site-map/sitemap-xml";
import { runSource } from "@/server/common/page-data";

// Built per request from the same cached project source, so new repos show up without a deploy.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const result = await runSource(getProjects);
        const slugs = result.ok ? result.data.slugs : [];
        return new Response(renderSitemapXml(sitemapPaths(slugs)), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
