import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import codeTitle from "remark-code-titles";

export default defineConfig({
  site: "https://blog.70-10.net/",
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: ["remark-gfm", "remark-smartypants", codeTitle],
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },
});
