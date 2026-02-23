// @vitest-environment node
// AstroContainer.create() requires Node.js environment (incompatible with jsdom)
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import Footer from "./Footer.astro";

describe("Footer", () => {
  describe("Positive Cases", () => {
    it("should render footer element", async () => {
      // Act
      const html = await renderComponent(Footer);

      // Assert
      expect(html).toContain("<footer");
    });

    it("should contain privacy policy link", async () => {
      // Act
      const html = await renderComponent(Footer);

      // Assert
      expect(html).toContain('href="/privacy-policy"');
      expect(html).toContain("プライバシーポリシー");
    });

    it("should contain GitHub link", async () => {
      // Act
      const html = await renderComponent(Footer);

      // Assert
      expect(html).toContain('href="https://github.com/70-10/blog"');
      expect(html).toContain("GitHub");
    });
  });
});
