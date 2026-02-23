// @vitest-environment node
// AstroContainer.create() requires Node.js environment (incompatible with jsdom)
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import ReadingProgressBar from "./ReadingProgressBar.astro";

describe("ReadingProgressBar", () => {
  describe("Positive Cases", () => {
    it("should render progress element", async () => {
      // Act
      const html = await renderComponent(ReadingProgressBar);

      // Assert
      expect(html).toContain("<progress");
    });

    it("should have correct id attribute", async () => {
      // Act
      const html = await renderComponent(ReadingProgressBar);

      // Assert
      expect(html).toContain('id="progress-bar"');
    });

    it("should have initial value of 0", async () => {
      // Act
      const html = await renderComponent(ReadingProgressBar);

      // Assert
      expect(html).toContain('value="0"');
    });

    it("should have max value of 100", async () => {
      // Act
      const html = await renderComponent(ReadingProgressBar);

      // Assert
      expect(html).toContain('max="100"');
    });
  });

  // Edge Cases / Negative Cases: Not applicable.
  // This is a static component with no props.
  // Client-side scroll behavior (is:inline script) cannot be tested in server rendering.
});
