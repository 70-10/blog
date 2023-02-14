import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import { defineConfig } from "astro/config";
import codeTitle from "remark-code-titles";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.70-10.net/",
  integrations: [tailwind(), compress(), react()],
  markdown: {
    remarkPlugins: ["remark-gfm", "remark-smartypants", codeTitle],
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },
});
