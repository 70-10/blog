import { describe, expect, it } from "vitest";
import { extractDomain, generateURL, htmlEncode } from "./index.js";

describe("remark-ogp-card utilities", () => {
  describe("generateURL", () => {
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

  describe("extractDomain", () => {
    it("should extract domain from valid URL", () => {
      // Arrange
      const url = "https://www.example.com/path?query=value";

      // Act
      const result = extractDomain(url);

      // Assert
      expect(result).toBe("www.example.com");
    });

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

    it("should handle protocol-relative URL", () => {
      // Arrange
      const url = "//example.com/path";

      // Act
      const result = extractDomain(url);

      // Assert
      expect(result).toBe("");
    });
  });

  describe("htmlEncode", () => {
    it("should encode ampersand", () => {
      // Arrange
      const text = "Rock & Roll";

      // Act
      const result = htmlEncode(text);

      // Assert
      expect(result).toBe("Rock &amp; Roll");
    });

    it("should encode less than and greater than", () => {
      // Arrange
      const text = "value < 10 > 5";

      // Act
      const result = htmlEncode(text);

      // Assert
      expect(result).toBe("value &lt; 10 &gt; 5");
    });

    it("should encode quotes", () => {
      // Arrange
      const text = "He said \"Hello\" and 'Goodbye'";

      // Act
      const result = htmlEncode(text);

      // Assert
      expect(result).toBe("He said &quot;Hello&quot; and &#39;Goodbye&#39;");
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

    it("should handle empty string", () => {
      // Arrange
      const text = "";

      // Act
      const result = htmlEncode(text);

      // Assert
      expect(result).toBe("");
    });

    it("should handle string with no special characters", () => {
      // Arrange
      const text = "Regular text with no special chars";

      // Act
      const result = htmlEncode(text);

      // Assert
      expect(result).toBe("Regular text with no special chars");
    });

    it("should handle unicode characters", () => {
      // Arrange
      const text = "こんにちは & 世界";

      // Act
      const result = htmlEncode(text);

      // Assert
      expect(result).toBe("こんにちは &amp; 世界");
    });
  });
});
