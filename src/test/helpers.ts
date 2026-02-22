import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

export async function renderComponent(
  Component: AstroComponentFactory,
  options: Record<string, unknown> = {},
) {
  const container = await AstroContainer.create();
  return await container.renderToString(Component, options);
}
