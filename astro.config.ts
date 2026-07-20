import { unified } from "@astrojs/markdown-remark";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import compress from "astro-compress";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
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
    compress(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        "remark-gfm",
        "remark-smartypants",
        codeTitle,
        ogpCardPlugin,
      ],
    }),
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },
  vite: {
    plugins: [...tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
  server: {
    host: true,
  },
});
