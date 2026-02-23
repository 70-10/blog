import ogs from "open-graph-scraper";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

type OgsResult = Awaited<ReturnType<typeof ogs>>;

interface TreeNode {
  type: string;
  value?: string;
  data?: Record<string, unknown>;
}

describe("remark-ogp-card utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateURL", () => {
    describe("Positive Cases", () => {
      it("should handle regular ASCII domain", () => {
        // Arrange
        const urlStr = "https://example.com/path?query=value";

        // Act
        const result = generateURL(urlStr);

        // Assert
        expect(result.hostname).toBe("example.com");
        expect(result.pathname).toBe("/path");
        expect(result.search).toBe("?query=value");
      });

      it("should return URL object with proper methods", () => {
        // Arrange
        const urlStr = "https://example.com";

        // Act
        const result = generateURL(urlStr);

        // Assert
        expect(typeof result.toString).toBe("function");
        expect(result.toString()).toBe("https://example.com/");
      });
    });

    describe("Edge Cases", () => {
      it("should convert international domain to ASCII", () => {
        // Arrange
        const urlStr = "https://日本.jp/path";

        // Act
        const result = generateURL(urlStr);

        // Assert
        expect(result.hostname).toBe("xn--wgv71a.jp");
        expect(result.pathname).toBe("/path");
        expect(result.protocol).toBe("https:");
      });

      it("should handle URL with port", () => {
        // Arrange
        const urlStr = "http://localhost:3000/api";

        // Act
        const result = generateURL(urlStr);

        // Assert
        expect(result.hostname).toBe("localhost");
        expect(result.port).toBe("3000");
        expect(result.pathname).toBe("/api");
      });
    });

    describe("Negative Cases", () => {
      it("should throw error for invalid URL", () => {
        // Act & Assert
        expect(() => generateURL("not a valid url")).toThrow();
      });
    });
  });

  describe("extractDomain", () => {
    describe("Positive Cases", () => {
      it("should extract domain from valid URL", () => {
        // Arrange
        const url = "https://www.example.com/path?query=value";

        // Act
        const result = extractDomain(url);

        // Assert
        expect(result).toBe("www.example.com");
      });
    });

    describe("Edge Cases", () => {
      it("should extract domain from URL with port", () => {
        // Arrange
        const url = "http://localhost:3000/api";

        // Act
        const result = extractDomain(url);

        // Assert
        expect(result).toBe("localhost");
      });

      it("should extract domain from international URL", () => {
        // Arrange
        const url = "https://日本.jp";

        // Act
        const result = extractDomain(url);

        // Assert
        expect(result).toBe("xn--wgv71a.jp");
      });

      it("should handle protocol-relative URL", () => {
        // Arrange
        const url = "//example.com/path";

        // Act
        const result = extractDomain(url);

        // Assert
        expect(result).toBe("");
      });
    });

    describe("Negative Cases", () => {
      it("should return empty string for invalid URL", () => {
        // Arrange
        const url = "not-a-valid-url";

        // Act
        const result = extractDomain(url);

        // Assert
        expect(result).toBe("");
      });

      it("should return empty string for empty input", () => {
        // Arrange
        const url = "";

        // Act
        const result = extractDomain(url);

        // Assert
        expect(result).toBe("");
      });
    });
  });

  describe("htmlEncode", () => {
    describe("Positive Cases", () => {
      it("should encode ampersand", () => {
        // Act & Assert
        expect(htmlEncode("Rock & Roll")).toBe("Rock &amp; Roll");
      });

      it("should encode less than and greater than", () => {
        // Act & Assert
        expect(htmlEncode("value < 10 > 5")).toBe("value &lt; 10 &gt; 5");
      });

      it("should encode quotes", () => {
        // Act & Assert
        expect(htmlEncode("He said \"Hello\" and 'Goodbye'")).toBe(
          "He said &quot;Hello&quot; and &#39;Goodbye&#39;",
        );
      });

      it("should encode all special characters together", () => {
        // Arrange
        const text = "<script>alert(\"XSS & 'attack'\");</script>";

        // Act
        const result = htmlEncode(text);

        // Assert
        expect(result).toBe(
          "&lt;script&gt;alert(&quot;XSS &amp; &#39;attack&#39;&quot;);&lt;/script&gt;",
        );
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty string", () => {
        // Act & Assert
        expect(htmlEncode("")).toBe("");
      });

      it("should handle string with no special characters", () => {
        // Act & Assert
        expect(htmlEncode("Regular text with no special chars")).toBe(
          "Regular text with no special chars",
        );
      });

      it("should handle unicode characters", () => {
        // Act & Assert
        expect(htmlEncode("こんにちは & 世界")).toBe("こんにちは &amp; 世界");
      });
    });

    // Negative Cases: Not applicable. htmlEncode is a pure string transformation function.
    // It accepts any string input and always returns a valid encoded string.
    // TypeScript type system prevents non-string inputs at compile time.
  });
});

describe("createYouTubeFrameElement", () => {
  describe("Positive Cases", () => {
    it("should return iframe HTML for valid videoId", () => {
      // Act
      const result = createYouTubeFrameElement("dQw4w9WgXcQ");

      // Assert
      expect(result).toContain(
        'src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      expect(result).toContain("iframe");
      expect(result).toContain("remark-card");
    });
  });

  describe("Edge Cases", () => {
    it("should return empty string for empty videoId", () => {
      // Act & Assert
      expect(createYouTubeFrameElement("")).toBe("");
    });
  });

  describe("Negative Cases", () => {
    it("should return empty string for null videoId", () => {
      // Act & Assert
      expect(createYouTubeFrameElement(null)).toBe("");
    });
  });
});

describe("createCardElement", () => {
  describe("Positive Cases", () => {
    it("should return card HTML with OGP data", async () => {
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockResolvedValue({
        result: { ogTitle: "Test Title" },
      } as unknown as OgsResult);

      // Act
      const result = await createCardElement("https://example.com");

      // Assert
      expect(result).toContain("Test Title");
      expect(result).toContain("example.com");
      expect(result).toContain("remark-card");
      expect(result).toContain("favicon");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined ogTitle", async () => {
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockResolvedValue({
        result: {},
      } as unknown as OgsResult);

      // Act
      const result = await createCardElement("https://example.com");

      // Assert
      expect(result).toContain("remark-card");
    });
  });

  describe("Negative Cases", () => {
    it("should throw when OGS throws error", async () => {
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(createCardElement("https://example.com")).rejects.toThrow(
        "Network error",
      );
    });
  });
});

describe("createElement", () => {
  describe("Positive Cases", () => {
    it("should return YouTube iframe for YouTube URL", async () => {
      // Arrange
      const url = new URL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      // Act
      const result = await createElement(url);

      // Assert
      expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should return OGP card for regular URL", async () => {
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockResolvedValue({
        result: { ogTitle: "Example" },
      } as unknown as OgsResult);
      const url = new URL("https://example.com");

      // Act
      const result = await createElement(url);

      // Assert
      expect(result).toContain("remark-card");
      expect(result).toContain("Example");
    });
  });

  describe("Edge Cases", () => {
    it("should return empty string for YouTube URL without v parameter", async () => {
      // Arrange
      const url = new URL("https://www.youtube.com/watch");

      // Act
      const result = await createElement(url);

      // Assert
      expect(result).toBe("");
    });
  });

  describe("Negative Cases", () => {
    it("should propagate error when OGS fails for non-YouTube URL", async () => {
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockRejectedValue(new Error("Fetch failed"));
      const url = new URL("https://example.com");

      // Act & Assert
      await expect(createElement(url)).rejects.toThrow("Fetch failed");
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
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockResolvedValue({
        result: { ogTitle: "Example Site" },
      } as unknown as OgsResult);

      // Act
      const tree = await processMarkdown("https://example.com\n");

      // Assert
      const htmlNode = tree.children[0] as TreeNode;
      expect(htmlNode.type).toBe("html");
      expect(htmlNode.value).toContain("remark-card");
    });

    it("should convert YouTube URL to iframe", async () => {
      // Act
      const tree = await processMarkdown(
        "https://www.youtube.com/watch?v=test123\n",
      );

      // Assert
      const htmlNode = tree.children[0] as TreeNode;
      expect(htmlNode.type).toBe("html");
      expect(htmlNode.value).toContain("youtube.com/embed/test123");
    });
  });

  describe("Edge Cases", () => {
    it("should not convert URL embedded in text", async () => {
      // Act
      const tree = await processMarkdown(
        "Check out https://example.com for more\n",
      );

      // Assert
      const node = tree.children[0] as TreeNode;
      expect(node.type).toBe("paragraph");
    });

    it("should not convert multiple URLs in paragraph", async () => {
      // Act
      const tree = await processMarkdown(
        "https://example.com https://example.org\n",
      );

      // Assert
      const node = tree.children[0] as TreeNode;
      expect(node.type).toBe("paragraph");
    });

    it("should skip paragraph with data property", async () => {
      // Arrange
      const processor = unified().use(remarkParse).use(ogpCardPlugin);
      const tree = processor.parse("https://example.com\n");
      (tree.children[0] as TreeNode).data = { foo: "bar" };

      // Act
      const result = await processor.run(tree);

      // Assert
      const node = result.children[0] as TreeNode;
      expect(node.type).toBe("paragraph");
    });
  });

  describe("Negative Cases", () => {
    it("should continue processing when OGS throws error", async () => {
      // Arrange
      const mockOgs = vi.mocked(ogs);
      mockOgs.mockRejectedValue(new Error("Network error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const tree = await processMarkdown("https://example.com\n");

      // Assert
      expect(tree).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
