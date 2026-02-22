// @vitest-environment node
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
      const html = await renderHeader({ displayBackButton: false });
      expect(html).toContain("mnml");
    });

    it("should include link to top page", async () => {
      const html = await renderHeader({ displayBackButton: false });
      expect(html).toContain('href="/"');
    });

    it("should render header element", async () => {
      const html = await renderHeader({ displayBackButton: false });
      expect(html).toContain("<header");
    });

    it("should render back button section when displayBackButton is true", async () => {
      const html = await renderHeader({ displayBackButton: true });
      const hrefMatches = html.match(/href="\/"/g);
      expect(hrefMatches!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Negative Cases", () => {
    it("should not render back button when displayBackButton is false", async () => {
      const htmlWithBack = await renderHeader({ displayBackButton: true });
      const htmlWithoutBack = await renderHeader({
        displayBackButton: false,
      });
      const withBackCount = (htmlWithBack.match(/href="\/"/g) || []).length;
      const withoutBackCount = (htmlWithoutBack.match(/href="\/"/g) || [])
        .length;
      expect(withoutBackCount).toBeLessThan(withBackCount);
    });
  });
});
