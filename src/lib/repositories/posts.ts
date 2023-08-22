import { CollectionEntry, getCollection } from "astro:content";
import { cdateJST } from "../cdate-jst";

export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  const entries = await getCollection("posts");

  return entries.sort(sortByPublishDate);
}

function sortByPublishDate(
  a: CollectionEntry<"posts">,
  b: CollectionEntry<"posts">,
): number {
  return (
    cdateJST(b.data.publishDate).toDate().getTime() -
    cdateJST(a.data.publishDate).toDate().getTime()
  );
}
