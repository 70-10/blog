import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()),
    description: z.string().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
