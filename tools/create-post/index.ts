import consola from "consola";
import { $ } from "execa";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import allTags from "./tags.json";
const templatePath = join(__dirname, "template.md");
const postsPath = join(__dirname, "..", "..", "src", "content", "posts");

async function main() {
  const title = (await consola.prompt(
    "Enter the title of the new post",
  )) as string;

  const slug = (await consola.prompt(
    "Enter the slug of the new post",
  )) as string;

  if (await checkSameSlug(slug)) {
    throw new Error("The slug already exists");
  }

  const tags = (await consola.prompt("Enter the tags of the new post", {
    type: "multiselect",
    required: true,
    options: allTags,
  })) as string[];

  const newFilePath = join(postsPath, `${slug}.md`);

  const content = await generateContent(templatePath, title, tags);

  await writeFile(newFilePath, content);
  await $`code ${newFilePath}`;
}

// Only run main if this file is executed directly (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export async function generateContent(
  templatePath: string,
  title: string,
  tags: string[],
) {
  return (await readFile(templatePath, "utf-8"))
    .replace("<title>", title)
    .replace("<date>", publishDate())
    .replace("<tags>", `"${tags.join('", "')}"`);
}

export function publishDate() {
  const now = new Date();
  return (
    now.toISOString().split("Z")[0] +
    (now.getTimezoneOffset() === -540 ? "+09:00" : "Z")
  );
}

export async function checkSameSlug(slug: string) {
  const files = await readdir(postsPath);
  return files.some((file) => file === `${slug}.md`);
}
