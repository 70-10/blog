import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import { defineConfig } from "astro/config";
import rehypeBudouxParagraph from "rehype-budoux-paragraph";
import codeTitle from "remark-code-titles";
import ogpCardPlugin from "./tools/remark-ogp-card";

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
    remarkPlugins: [
      "remark-gfm",
      "remark-smartypants",
      codeTitle,
      ogpCardPlugin,
    ],
    rehypePlugins: [rehypeBudouxParagraph],
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },
  server: {
    host: "127.0.0.1",
  },
});
