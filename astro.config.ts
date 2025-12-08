import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import compress from "astro-compress";
import { defineConfig } from "astro/config";
import codeTitle from "remark-code-titles";
import ogpCardPlugin from "./tools/remark-ogp-card";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.70-10.net/",
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  integrations: [compress(), react()],
  markdown: {
    remarkPlugins: [
      "remark-gfm",
      "remark-smartypants",
      codeTitle,
      ogpCardPlugin,
    ],
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss({ applyBaseStyles: false })],
  },
  server: {
    host: true,
  },
});
