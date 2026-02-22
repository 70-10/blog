// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import ReadingProgressBar from "./ReadingProgressBar.astro";

describe("ReadingProgressBar", () => {
  describe("Positive Cases", () => {
    it("should render progress element", async () => {
      const html = await renderComponent(ReadingProgressBar);
      expect(html).toContain("<progress");
    });

    it("should have correct id attribute", async () => {
      const html = await renderComponent(ReadingProgressBar);
      expect(html).toContain('id="progress-bar"');
    });

    it("should have initial value of 0", async () => {
      const html = await renderComponent(ReadingProgressBar);
      expect(html).toContain('value="0"');
    });

    it("should have max value of 100", async () => {
      const html = await renderComponent(ReadingProgressBar);
      expect(html).toContain('max="100"');
    });
  });
});
