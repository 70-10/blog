import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import { defineConfig } from "astro/config";
import codeTitle from "remark-code-titles";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.70-10.net/",
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    compress(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    remarkPlugins: ["remark-gfm", "remark-smartypants", codeTitle],
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },
});
