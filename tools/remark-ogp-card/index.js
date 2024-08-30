import { toASCII, toUnicode } from "node:punycode";
import { URL } from "node:url";
import ogs from "open-graph-scraper";
import { visit } from "unist-util-visit";

export default function ogpCardPlugin() {
  return async (tree) => {
    const transformers = [];
    visit(tree, "paragraph", (paragraphNode, index) => {
      if (paragraphNode.children.length !== 1) {
        return tree;
      }

      if (paragraphNode && paragraphNode.data !== undefined) {
        return tree;
      }

      visit(paragraphNode, "text", (textNode) => {
        const urls = textNode.value.match(/(https?:\/\/[^\s]+)/g);

        if (!urls || urls.length !== 1) {
          return;
        }

        const url = generateURL(urls[0]);
        transformers.push(async () => {
          const cardNode = {
            type: "html",
            value: await createElement(url),
          };

          tree.children.splice(index, 1, cardNode);
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

async function createElement(url) {
  switch (url.hostname) {
    case "www.youtube.com": {
      const videoId = url.searchParams.get("v");
      return createYouTubeFrameElement(videoId);
    }
    default:
      return await createCardElement(url.toString());
  }
}

function generateURL(urlStr) {
  const url = new URL(urlStr);
  url.hostname = toASCII(url.hostname);
  return url;
}

async function createCardElement(url) {
  const { result } = await ogs({ url });
  const domain = extractDomain(url);
  const title = result.ogTitle;

  return `
<div class="remark-card">
  <a href="${url}" target="_blank" rel="noopener noreferrer">
    <h5 class="title">${htmlEncode(title)}</h5>
    <div class="site">
      <img src="https://icons.duckduckgo.com/ip3/${domain}.ico" alt="favicon" class="favicon" />
      <p class="domain">${toUnicode(domain)}</p>
    </div>
  </a>
</div>
`;
}

function createYouTubeFrameElement(videoId) {
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

function extractDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return "";
  }
}

function htmlEncode(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
