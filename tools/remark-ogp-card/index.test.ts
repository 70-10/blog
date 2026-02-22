import ogs from "open-graph-scraper";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it, vi } from "vitest";
import ogpCardPlugin, {
  createCardElement,
  createElement,
  createYouTubeFrameElement,
  extractDomain,
  generateURL,
  htmlEncode,
} from "./index.js";

vi.mock("open-graph-scraper", () => ({
  default: vi.fn(),
}));

interface TreeNode {
  type: string;
  value?: string;
  data?: Record<string, unknown>;
}

describe("remark-ogp-card utilities", () => {
  describe("generateURL", () => {
    it("should convert international domain to ASCII", () => {
      const urlStr = "https://日本.jp/path";
      const result = generateURL(urlStr);
      expect(result.hostname).toBe("xn--wgv71a.jp");
      expect(result.pathname).toBe("/path");
      expect(result.protocol).toBe("https:");
    });

    it("should handle regular ASCII domain", () => {
      const urlStr = "https://example.com/path?query=value";
      const result = generateURL(urlStr);
      expect(result.hostname).toBe("example.com");
      expect(result.pathname).toBe("/path");
      expect(result.search).toBe("?query=value");
    });

    it("should handle URL with port", () => {
      const urlStr = "http://localhost:3000/api";
      const result = generateURL(urlStr);
      expect(result.hostname).toBe("localhost");
      expect(result.port).toBe("3000");
      expect(result.pathname).toBe("/api");
    });

    it("should return URL object with proper methods", () => {
      const urlStr = "https://example.com";
      const result = generateURL(urlStr);
      expect(typeof result.toString).toBe("function");
      expect(result.toString()).toBe("https://example.com/");
    });
  });

  describe("extractDomain", () => {
    it("should extract domain from valid URL", () => {
      const url = "https://www.example.com/path?query=value";
      const result = extractDomain(url);
      expect(result).toBe("www.example.com");
    });

    it("should extract domain from URL with port", () => {
      const url = "http://localhost:3000/api";
      const result = extractDomain(url);
      expect(result).toBe("localhost");
    });

    it("should extract domain from international URL", () => {
      const url = "https://日本.jp";
      const result = extractDomain(url);
      expect(result).toBe("xn--wgv71a.jp");
    });

    it("should return empty string for invalid URL", () => {
      const url = "not-a-valid-url";
      const result = extractDomain(url);
      expect(result).toBe("");
    });

    it("should return empty string for empty input", () => {
      const url = "";
      const result = extractDomain(url);
      expect(result).toBe("");
    });

    it("should handle protocol-relative URL", () => {
      const url = "//example.com/path";
      const result = extractDomain(url);
      expect(result).toBe("");
    });
  });

  describe("htmlEncode", () => {
    it("should encode ampersand", () => {
      const text = "Rock & Roll";
      const result = htmlEncode(text);
      expect(result).toBe("Rock &amp; Roll");
    });

    it("should encode less than and greater than", () => {
      const text = "value < 10 > 5";
      const result = htmlEncode(text);
      expect(result).toBe("value &lt; 10 &gt; 5");
    });

    it("should encode quotes", () => {
      const text = "He said \"Hello\" and 'Goodbye'";
      const result = htmlEncode(text);
      expect(result).toBe("He said &quot;Hello&quot; and &#39;Goodbye&#39;");
    });

    it("should encode all special characters together", () => {
      const text = "<script>alert(\"XSS & 'attack'\");</script>";
      const result = htmlEncode(text);
      expect(result).toBe(
        "&lt;script&gt;alert(&quot;XSS &amp; &#39;attack&#39;&quot;);&lt;/script&gt;",
      );
    });

    it("should handle empty string", () => {
      const text = "";
      const result = htmlEncode(text);
      expect(result).toBe("");
    });

    it("should handle string with no special characters", () => {
      const text = "Regular text with no special chars";
      const result = htmlEncode(text);
      expect(result).toBe("Regular text with no special chars");
    });

    it("should handle unicode characters", () => {
      const text = "こんにちは & 世界";
      const result = htmlEncode(text);
      expect(result).toBe("こんにちは &amp; 世界");
    });
  });
});

describe("createYouTubeFrameElement", () => {
  describe("Positive Cases", () => {
    it("should return iframe HTML for valid videoId", () => {
      const result = createYouTubeFrameElement("dQw4w9WgXcQ");
      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain("iframe");
      expect(result).toContain("remark-card");
    });
  });
  describe("Edge Cases", () => {
    it("should return empty string for empty videoId", () => {
      const result = createYouTubeFrameElement("");
      expect(result).toBe("");
    });
  });
  describe("Negative Cases", () => {
    it("should return empty string for null videoId", () => {
      const result = createYouTubeFrameElement(null);
      expect(result).toBe("");
    });
  });
});

describe("createCardElement", () => {
  describe("Positive Cases", () => {
    it("should return card HTML with OGP data", async () => {
      const mockOgs = vi.mocked(ogs);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockOgs.mockResolvedValue({ result: { ogTitle: "Test Title" } } as any);
      const result = await createCardElement("https://example.com");
      expect(result).toContain("Test Title");
      expect(result).toContain("example.com");
      expect(result).toContain("remark-card");
      expect(result).toContain("favicon");
    });
  });
  describe("Edge Cases", () => {
    it("should handle undefined ogTitle", async () => {
      const mockOgs = vi.mocked(ogs);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockOgs.mockResolvedValue({ result: {} } as any);
      const result = await createCardElement("https://example.com");
      expect(result).toContain("remark-card");
    });
  });
  describe("Negative Cases", () => {
    it("should throw when OGS throws error", async () => {
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockRejectedValue(new Error("Network error"));
      await expect(createCardElement("https://example.com")).rejects.toThrow(
        "Network error",
      );
    });
  });
});

describe("createElement", () => {
  describe("Positive Cases", () => {
    it("should return YouTube iframe for YouTube URL", async () => {
      const url = new URL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const result = await createElement(url);
      expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    });
    it("should return OGP card for regular URL", async () => {
      const mockOgs = vi.mocked(ogs);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockOgs.mockResolvedValue({ result: { ogTitle: "Example" } } as any);
      const url = new URL("https://example.com");
      const result = await createElement(url);
      expect(result).toContain("remark-card");
      expect(result).toContain("Example");
    });
  });
  describe("Edge Cases", () => {
    it("should return empty string for YouTube URL without v parameter", async () => {
      const url = new URL("https://www.youtube.com/watch");
      const result = await createElement(url);
      expect(result).toBe("");
    });
  });
});

describe("ogpCardPlugin", () => {
  async function processMarkdown(md: string) {
    const processor = unified().use(remarkParse).use(ogpCardPlugin);
    const tree = processor.parse(md);
    return await processor.run(tree);
  }

  describe("Positive Cases", () => {
    it("should convert standalone URL to OGP card", async () => {
      const mockOgs = vi.mocked(ogs);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockOgs.mockResolvedValue({ result: { ogTitle: "Example Site" } } as any);
      const tree = await processMarkdown("https://example.com\n");
      const htmlNode = tree.children[0] as TreeNode;
      expect(htmlNode.type).toBe("html");
      expect(htmlNode.value).toContain("remark-card");
    });

    it("should convert YouTube URL to iframe", async () => {
      const tree = await processMarkdown(
        "https://www.youtube.com/watch?v=test123\n",
      );
      const htmlNode = tree.children[0] as TreeNode;
      expect(htmlNode.type).toBe("html");
      expect(htmlNode.value).toContain("youtube.com/embed/test123");
    });
  });

  describe("Edge Cases", () => {
    it("should not convert URL embedded in text", async () => {
      const tree = await processMarkdown(
        "Check out https://example.com for more\n",
      );
      const node = tree.children[0] as TreeNode;
      expect(node.type).toBe("paragraph");
    });

    it("should not convert multiple URLs in paragraph", async () => {
      const tree = await processMarkdown(
        "https://example.com https://example.org\n",
      );
      const node = tree.children[0] as TreeNode;
      expect(node.type).toBe("paragraph");
    });

    it("should skip paragraph with data property", async () => {
      const processor = unified().use(remarkParse).use(ogpCardPlugin);
      const tree = processor.parse("https://example.com\n");
      (tree.children[0] as TreeNode).data = { foo: "bar" };
      const result = await processor.run(tree);
      const node = result.children[0] as TreeNode;
      expect(node.type).toBe("paragraph");
    });
  });

  describe("Negative Cases", () => {
    it("should continue processing when OGS throws error", async () => {
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockRejectedValue(new Error("Network error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const tree = await processMarkdown("https://example.com\n");
      consoleSpy.mockRestore();
      expect(tree).toBeDefined();
    });
  });
});
