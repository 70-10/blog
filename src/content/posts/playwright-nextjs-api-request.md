---
title: Next.jsのCSR/SSR/SSGをPlaywrightでテストする
publishDate: 2023-05-23T14:40:00+09:00
tags: ["Web Frontend", "Next.js", "Test", "Playwright"]
---

```
npm install -DE @playwright/test
```

```ts:playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

```ts:tests/api-request.test.ts
import { expect, test } from "@playwright/test";

const pokemonName = "pikachu";

test("CSR (Client-side Rendering)", async ({ page }) => {
  await page.goto("/csr");

  await expect(page.getByAltText(pokemonName)).toBeVisible();
  await expect(page.getByText(pokemonName)).toBeVisible();
});

test("SSR (Server-side Rendering)", async ({ page }) => {
  await page.goto("/ssr");

  await expect(page.getByAltText(pokemonName)).toBeVisible();
  await expect(page.getByText(pokemonName)).toBeVisible();
});

test("SSG (Static-site Generation)", async ({ page }) => {
  await page.goto("/ssg");

  await expect(page.getByAltText(pokemonName)).toBeVisible();
  await expect(page.getByText(pokemonName)).toBeVisible();
});
```

# Mock でピカチュウをメタモンに変身させる
