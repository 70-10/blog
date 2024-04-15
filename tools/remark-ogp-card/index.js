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
        const urls = textNode.value.match(
          /(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g,
        );

        if (!urls || urls.length !== 1) {
          return;
        }

        const url = urls[0];
        transformers.push(async () => {
          const { result } = await ogs({ url });

          const cardNode = {
            type: "html",
            value: createCard(url, extractDomain(url), result.ogTitle),
          };

          tree.children.splice(index, 1, cardNode);
        });
      });
    });

    try {
      await Promise.all(transformers.map((t) => t()));
    } catch (error) {
      console.error(`remark-ogp-card: ${error}`);
    }

    return tree;
  };
}

function createCard(url, domain, title) {
  return `
<div class="remark-card">
  <a href="${url}" target="_blank" rel="noopener noreferrer">
    <h5 class="title">${htmlEncode(title)}</h5>
    <div class="site">
      <img src="https://icons.duckduckgo.com/ip3/${domain}.ico" alt="favicon" class="favicon" />
      <p class="domain">${domain}</p>
    </div>
  </a>
</div>
`;
}

function extractDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
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
