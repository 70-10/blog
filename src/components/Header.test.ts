// @vitest-environment node
// React server rendering with AstroContainer requires Node.js environment
// Note: Header uses its own rendering setup instead of shared helpers
// because it's a React component requiring @astrojs/react renderer
import { getContainerRenderer as reactContainerRenderer } from "@astrojs/react";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";
import { loadRenderers } from "astro:container";
import { describe, expect, it } from "vitest";
import Header from "./Header.astro";

async function renderHeader(props: Record<string, unknown>) {
  const renderers = await loadRenderers([reactContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return await container.renderToString(Header, {
    props,
  } as ContainerRenderOptions);
}

describe("Header", () => {
  describe("Positive Cases", () => {
    it("should display site title 'mnml'", async () => {
      // Act
      const html = await renderHeader({ displayBackButton: false });

      // Assert
      expect(html).toContain("mnml");
    });

    it("should include link to top page", async () => {
      // Act
      const html = await renderHeader({ displayBackButton: false });

      // Assert
      expect(html).toContain('href="/"');
    });

    it("should render header element", async () => {
      // Act
      const html = await renderHeader({ displayBackButton: false });

      // Assert
      expect(html).toContain("<header");
    });

    it("should render back button section when displayBackButton is true", async () => {
      // Act
      const html = await renderHeader({ displayBackButton: true });

      // Assert
      const hrefMatches = html.match(/href="\/"/g);
      expect(hrefMatches!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Negative Cases", () => {
    it("should not render back button when displayBackButton is false", async () => {
      // Arrange
      const htmlWithBack = await renderHeader({ displayBackButton: true });
      const htmlWithoutBack = await renderHeader({
        displayBackButton: false,
      });

      // Act
      const withBackCount = (htmlWithBack.match(/href="\/"/g) || []).length;
      const withoutBackCount = (htmlWithoutBack.match(/href="\/"/g) || [])
        .length;

      // Assert
      expect(withoutBackCount).toBeLessThan(withBackCount);
    });
  });
});
