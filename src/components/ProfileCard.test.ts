// @vitest-environment node
// AstroContainer.create() requires Node.js environment (incompatible with jsdom)
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import ProfileCard from "./ProfileCard.astro";

describe("ProfileCard", () => {
  describe("Positive Cases", () => {
    it("should display profile name", async () => {
      // Act
      const html = await renderComponent(ProfileCard);

      // Assert
      expect(html).toContain("70_10");
    });

    it("should contain X link", async () => {
      // Act
      const html = await renderComponent(ProfileCard);

      // Assert
      expect(html).toContain("https://x.com/70_10");
    });

    it("should contain GitHub link", async () => {
      // Act
      const html = await renderComponent(ProfileCard);

      // Assert
      expect(html).toContain("https://github.com/70-10");
    });
  });

  // Edge Cases / Negative Cases: Not applicable.
  // This is a static component with no props or dynamic behavior.
});
