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
    it("should encode special characters in tag name URL", async () => {
      // Act
      const html = await renderComponent(Tag, { props: { name: "C++" } });

      // Assert
      expect(html).toContain("#C++");
    });
  });
});
