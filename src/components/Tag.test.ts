// @vitest-environment node
// AstroContainer.create() requires Node.js environment (incompatible with jsdom)
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import Tag from "./Tag.astro";

describe("Tag", () => {
  describe("Positive Cases", () => {
    it("should display tag name with hash prefix", async () => {
      // Act
      const html = await renderComponent(Tag, {
        props: { name: "javascript" },
      });

      // Assert
      expect(html).toContain("#javascript");
    });

    it("should generate correct tag link", async () => {
      // Act
      const html = await renderComponent(Tag, {
        props: { name: "javascript" },
      });

      // Assert
      expect(html).toContain('href="/tags/javascript"');
    });

    it("should render as anchor element", async () => {
      // Act
      const html = await renderComponent(Tag, { props: { name: "test" } });

      // Assert
      expect(html).toContain("<a");
    });
  });

  describe("Edge Cases", () => {
    it("should keep plus signs in tag name URL", async () => {
      // Act
      const html = await renderComponent(Tag, { props: { name: "C++" } });

      // Assert
      expect(html).toContain("#C++");
      // encodeURI does not encode '+', so href keeps the plus signs
      expect(html).toContain('href="/tags/C++"');
    });

    it("should encode multibyte characters in tag name URL", async () => {
      // Act
      const html = await renderComponent(Tag, { props: { name: "日本語" } });

      // Assert
      expect(html).toContain("#日本語");
      expect(html).toContain('href="/tags/%E6%97%A5%E6%9C%AC%E8%AA%9E"');
    });
  });
});
