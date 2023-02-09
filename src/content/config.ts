import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    publishDate: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean(),
  }),
});

export const collections = {
  posts: postsCollection,
};
