import { defineConfig } from "astro/config";
import { URL, fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

const isBuildCommand = process.argv.includes("build");

export default defineConfig({
  site: "https://www.gorkemkaryol.dev",
  output: "static",
  adapter: cloudflare({
    imageService: "compile",
  }),
  session: {
    driver: "memory",
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        ...(isBuildCommand
          ? {
              "react-dom/server": "react-dom/server.edge",
            }
          : {}),
      },
    },
  },
});
