import { getEntryBySlug } from "astro:content";
import { getOgImage } from "../../components/OgpImage";
import { getPosts } from "../../lib/repositories/posts";

export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

export async function get({ params, request }) {
  const post = await getEntryBySlug("posts", params.slug);

  const body = await getOgImage(post?.data.title as string);

  return {
    body,
    encoding: "binary",
  };
}
