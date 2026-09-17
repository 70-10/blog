import consola from "consola";
import { $ } from "execa";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import allTags from "./tags.json";
const templatePath = join(import.meta.dirname, "template.md");
const postsPath = join(
  import.meta.dirname,
  "..",
  "..",
  "src",
  "content",
  "posts",
);

export async function main() {
  const { values } = parseArgs({
    options: {
      title: { type: "string" },
      slug: { type: "string" },
      tag: { type: "string", multiple: true },
      "output-dir": { type: "string" },
      "no-open": { type: "boolean", default: false },
    },
  });
  const nonInteractive =
    values.title !== undefined ||
    values.slug !== undefined ||
    values.tag !== undefined;
  if (
    nonInteractive &&
    (!values.title?.trim() ||
      !values.slug ||
      !values.tag?.length ||
      values.tag.some((tag) => !tag.trim()))
  ) {
    throw new Error(
      "Non-interactive mode requires --title, --slug and at least one --tag",
    );
  }
  const outputDir = values["output-dir"] ?? postsPath;
  const title =
    values.title ??
    ((await consola.prompt("Enter the title of the new post")) as string);

  const slug =
    values.slug ??
    ((await consola.prompt("Enter the slug of the new post")) as string);

  if (typeof title !== "string" || typeof slug !== "string") {
    throw new Error("Post creation cancelled");
  }
  if (
    !slug.trim() ||
    slug === "." ||
    slug === ".." ||
    slug.includes("/") ||
    slug.includes("\\") ||
    slug.includes("\0")
  ) {
    throw new Error("The slug must be a single file name");
  }
  if (await checkSameSlug(slug, outputDir)) {
    throw new Error("The slug already exists");
  }

  const tags =
    values.tag ??
    ((await consola.prompt("Enter the tags of the new post", {
      type: "multiselect",
      required: true,
      options: allTags,
    })) as string[]);

  if (!Array.isArray(tags)) {
    throw new Error("Post creation cancelled");
  }
  const newFilePath = join(outputDir, `${slug}.md`);

  const content = await generateContent(templatePath, title, tags);

  await writeFile(newFilePath, content, { flag: "wx" });
  if (!values["no-open"]) {
    await $`code ${newFilePath}`;
  }
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

export async function checkSameSlug(slug: string, directory = postsPath) {
  const files = await readdir(directory);
  return files.some((file) => file === `${slug}.md`);
}
