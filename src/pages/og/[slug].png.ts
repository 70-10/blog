import { getOgImage } from "@/components/OgpImage";
import { getPosts } from "@/lib/repositories/posts";
import type { APIContext } from "astro";
import { getEntryBySlug } from "astro:content";

export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

export async function GET({ params }: APIContext) {
  if (!params.slug) {
    throw new Error("Slug not found");
  }

  const post = await getEntryBySlug("posts", params.slug);

  const body = await getOgImage(post?.data.title as string);

  return new Response(body, {
    headers: { "Content-Type": "image/png" },
  });
}
