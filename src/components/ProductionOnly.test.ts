// @vitest-environment node
// AstroContainer.create() requires Node.js environment (incompatible with jsdom)
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ProductionOnly", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("Positive Cases", () => {
    it("should render slot content when isProduction is true", async () => {
      // Arrange
      vi.doMock("@/lib/environments", () => ({
        isProduction: true,
        shouldSkipOgGeneration: false,
      }));
      const { default: ProductionOnly } =
        await import("./ProductionOnly.astro");
      const container = await AstroContainer.create();

      // Act
      const html = await container.renderToString(
        ProductionOnly as AstroComponentFactory,
        {
          slots: { default: "production content" },
        },
      );

      // Assert
      expect(html).toContain("production content");
    });
  });

  describe("Negative Cases", () => {
    it("should not render slot content when isProduction is false", async () => {
      // Arrange
      vi.doMock("@/lib/environments", () => ({
        isProduction: false,
        shouldSkipOgGeneration: false,
      }));
      const { default: ProductionOnly } =
        await import("./ProductionOnly.astro");
      const container = await AstroContainer.create();

      // Act
      const html = await container.renderToString(
        ProductionOnly as AstroComponentFactory,
        {
          slots: { default: "production content" },
        },
      );

      // Assert
      expect(html).not.toContain("production content");
    });
  });
});
