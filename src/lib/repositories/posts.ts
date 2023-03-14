import { CollectionEntry, getCollection } from "astro:content";
import { cdate } from "cdate";

export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  const entries = await getCollection("posts");

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
