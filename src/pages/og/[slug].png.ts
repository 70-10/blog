import { getOgImage } from "@/components/OgpImage";
import { shouldSkipOgGeneration } from "@/lib/environments";
import { getPosts } from "@/lib/repositories/posts";
import type { APIContext } from "astro";
import { getEntry } from "astro:content";

export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.id },
  }));
}

export async function GET({ params }: APIContext) {
  if (!params.slug) {
    throw new Error("Slug not found");
  }

  // OGP画像生成をスキップする場合は404を返す
  if (shouldSkipOgGeneration) {
    return new Response("OGP image generation is skipped", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const post = await getEntry("posts", params.slug);

  const body = await getOgImage(post?.data.title as string);

  return new Response(body, {
    headers: { "Content-Type": "image/png" },
  });
}
