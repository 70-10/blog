import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { marked } from "marked";
import { getPosts } from "../lib/repositories/posts";

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: "Blog",
    description: "Blog written by 70_10",
    site: context.site?.toString() ?? "",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.publishDate),
      description: marked.parse(post.body),
      link: `/posts/${post.slug}`,
    })),
  });
}
