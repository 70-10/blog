import { CollectionEntry, getCollection } from "astro:content";
import { cdate } from "cdate";
import { isDevelopment } from "../environments";

export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  const entries = isDevelopment
    ? await getCollection("posts")
    : await getCollection("posts", ({ data }) => !data.draft);

  return entries.sort(sortByPublishDate);
}

function sortByPublishDate(
  a: CollectionEntry<"posts">,
  b: CollectionEntry<"posts">
): number {
  return (
    cdate(b.data.publishDate).toDate().getTime() -
    cdate(a.data.publishDate).toDate().getTime()
  );
}
