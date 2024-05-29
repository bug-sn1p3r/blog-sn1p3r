import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import sectionize from "@hbsnow/rehype-sectionize";
import { BASE, SITE } from "./src/consts";

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    rehypePlugins: [sectionize],
  },
  integrations: [
    expressiveCode({
      themes: ["vitesse-dark"],
    }),
    mdx(),
    sitemap(),
    tailwind(),
  ],
});
