import type { Html, Paragraph, Root, Text } from "mdast";
import { toASCII, toUnicode } from "node:punycode";
import { URL } from "node:url";
import ogs from "open-graph-scraper";
import type { Node } from "unist";
import { visit } from "unist-util-visit";

interface OpenGraphResult {
  result: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: Array<{ url: string }>;
    ogUrl?: string;
  };
}

interface ParagraphNode extends Paragraph {
  children: Text[];
  data?: Record<string, unknown>;
}

interface TextNode extends Text {
  value: string;
}

export default function ogpCardPlugin() {
  return async (tree: Root): Promise<Root> => {
    const transformers: Array<() => Promise<void>> = [];

    visit(tree, "paragraph", (paragraphNode: Node, index?: number) => {
      const paragraph = paragraphNode as ParagraphNode;

      if (paragraph.children.length !== 1) {
        return;
      }

      if (paragraph && paragraph.data !== undefined) {
        return;
      }

      visit(paragraph, "text", (textNode: Node) => {
        const text = textNode as TextNode;
        const urls = text.value.match(/(https?:\/\/[^\s]+)/g);

        if (!urls || urls.length !== 1) {
          return;
        }

        const url = generateURL(urls[0]);
        transformers.push(async () => {
          const cardNode: Html = {
            type: "html",
            value: await createElement(url),
          };

          if (typeof index === "number") {
            tree.children.splice(index, 1, cardNode);
          }
        });
      });
    });

    try {
      await Promise.all(transformers.map((t) => t()));
    } catch (error) {
      console.error("remark-ogp-card:", error);
    }

    return tree;
  };
}

async function createElement(url: URL): Promise<string> {
  switch (url.hostname) {
    case "www.youtube.com": {
      const videoId = url.searchParams.get("v");
      return createYouTubeFrameElement(videoId);
    }
    default:
      return await createCardElement(url.toString());
  }
}

export function generateURL(urlStr: string): URL {
  const url = new URL(urlStr);
  url.hostname = toASCII(url.hostname);
  return url;
}

async function createCardElement(url: string): Promise<string> {
  const { result }: OpenGraphResult = await ogs({ url });
  const domain = extractDomain(url);
  const title = result.ogTitle;

  return `
<div class="remark-card">
  <a href="${url}" target="_blank" rel="noopener noreferrer">
    <h5 class="title">${htmlEncode(title || "")}</h5>
    <div class="site">
      <img src="https://icons.duckduckgo.com/ip3/${domain}.ico" alt="favicon" class="favicon" />
      <p class="domain">${toUnicode(domain)}</p>
    </div>
  </a>
</div>
`;
}

function createYouTubeFrameElement(videoId: string | null): string {
  if (!videoId) {
    return "";
  }

  return `
<div class="remark-card">
  <iframe
    class="w-full"
    style="aspect-ratio: 16 / 9;"
    src="https://www.youtube.com/embed/${videoId}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" 
    allowfullscreen
  ></iframe>
</div>`;
}

export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return "";
  }
}

export function htmlEncode(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
