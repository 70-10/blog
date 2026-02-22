// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderComponent } from "../test/helpers";
import ProfileCard from "./ProfileCard.astro";

describe("ProfileCard", () => {
  describe("Positive Cases", () => {
    it("should display profile name", async () => {
      const html = await renderComponent(ProfileCard);
      expect(html).toContain("70_10");
    });

    it("should contain X (Twitter) link", async () => {
      const html = await renderComponent(ProfileCard);
      expect(html).toContain("https://x.com/70_10");
    });

    it("should contain GitHub link", async () => {
      const html = await renderComponent(ProfileCard);
      expect(html).toContain("https://github.com/70-10");
    });
  });
});
