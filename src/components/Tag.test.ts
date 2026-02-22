// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import Tag from "./Tag.astro";

describe("Tag", () => {
  describe("Positive Cases", () => {
    it("should display tag name with hash prefix", async () => {
      const html = await renderComponent(Tag, {
        props: { name: "javascript" },
      });
      expect(html).toContain("#javascript");
    });

    it("should generate correct tag link", async () => {
      const html = await renderComponent(Tag, {
        props: { name: "javascript" },
      });
      expect(html).toContain('href="/tags/javascript"');
    });

    it("should render as anchor element", async () => {
      const html = await renderComponent(Tag, { props: { name: "test" } });
      expect(html).toContain("<a");
    });
  });

  describe("Edge Cases", () => {
    it("should encode special characters in tag name URL", async () => {
      const html = await renderComponent(Tag, { props: { name: "C++" } });
      expect(html).toContain("#C++");
    });
  });
});
