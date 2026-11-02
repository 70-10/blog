# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Astro 7, deployed at https://blog.70-10.net. Uses pnpm workspace architecture with custom tools for post creation and OGP card generation.

## Development Commands

### Essential Commands

- `pnpm dev` - Start development server (accessible at http://localhost:4321)
- `pnpm build` - Production build (generates OGP images)
- `pnpm build:local` - Local build (skips OGP image generation via `SKIP_OG_GENERATION=true`)
- `pnpm preview` - Preview production build locally

### Testing

- `pnpm test` - Run tests in watch mode (Vitest)
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Launch Vitest UI

### Linting & Formatting

- `pnpm lint` - Run all linters in parallel (ESLint, Prettier, textlint)
- `pnpm fix` - Auto-fix all linting issues
- `pnpm lint:eslint` - ESLint only (with friendly formatter)
- `pnpm lint:prettier` - Prettier check only
- `pnpm lint:textlint` - Japanese text linting for markdown posts in `src/content/posts/**/*.md`

Note: Pre-commit hooks automatically run `lefthook` which applies ESLint, Prettier, and textlint fixes to staged files.

### Content Management

- `pnpm create-post` - Interactive CLI tool to create new blog posts (uses `tools/create-post`)

## Architecture

### Content Collections

- Posts defined in `src/content.config.ts` using Astro's glob loader
- Post markdown files in `src/content/posts/` with frontmatter schema:
  ```typescript
  {
    title: string
    publishDate: Date
    tags: string[]
    description?: string
  }
  ```
- Images stored in `src/content/images/`

### OGP Image Generation

- Dynamic OGP images generated at build time in `src/pages/og/[slug].png.ts`
- Uses Satori for React-to-SVG conversion and Sharp for PNG output
- Component: `src/components/OgpImage.tsx`
- Can skip generation locally with `SKIP_OG_GENERATION=true` (check `src/lib/environments.ts`)

### Custom Remark Plugins

- `tools/remark-ogp-card/` - Custom plugin for embedding OGP cards from URLs
  - Detects standalone URLs in paragraphs
  - Fetches OpenGraph metadata
  - Special handling for YouTube embeds (converts to iframe)
  - Configured in `astro.config.ts`

### Styling

- TailwindCSS 4 via Vite plugin (configured with `applyBaseStyles: false`)
- GitHub markdown CSS for post content (`github-markdown-css`)
- Custom styles in `src/styles/`

### Layout System

- `src/layouts/Layout.astro` - Base layout with SEO, analytics
- `src/layouts/MarkdownLayout.astro` - Post layout with reading progress bar
- Components: Header, Footer, ProfileCard, Tag, ReadingProgressBar

### Analytics & Third-party

- Google Analytics 4 (production only via `ProductionOnly.astro`)
- Partytown for offloading third-party scripts

### Package Manager

- Uses pnpm with workspaces (`pnpm-workspace.yaml`)
- Managed by mise (see `mise.toml` for pnpm version)

### Development Container

- Devcontainer configuration in `.devcontainer/devcontainer.json`
- Node 22 environment with pnpm pre-configured
- Includes textlint auto-fix on save

## Testing Strategy

- Vitest for unit tests
- Test files colocated with source (e.g., `src/lib/repositories/posts.test.ts`)
- Coverage reports via `@vitest/coverage-v8`

## Rules and What Enforces Them

When a correction repeats, fix the mistake and add a row. If the rule is already here and nothing enforces it, add the enforcement in the same change. Drop a row once its mistake can no longer happen.

| Rule                                                                                         | Enforced by                                                                                                |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Every `it` / `test` body has `// Arrange`, `// Act`, `// Assert`                             | ESLint `local/require-aaa-comments` (`eslint-rules/`)                                                      |
| No `as any`; cast with `as unknown as T`                                                     | ESLint `@typescript-eslint/no-explicit-any` and `local/no-disable-no-explicit-any`                         |
| No stale `eslint-disable` comments                                                           | `linterOptions.reportUnusedDisableDirectives: "error"` in `eslint.config.mjs`                              |
| Lint problems left after an agent's edit reach the agent                                     | `scripts/format-and-lint-hook.sh` (PostToolUse, exits 2), tested by `scripts/format-and-lint-hook.test.ts` |
| Tools ignore other agents' worktrees in `.claude/worktrees/`                                 | `exclude` in `vitest.config.ts`, `ignores` in `eslint.config.mjs`, `.prettierignore`                       |
| A lint exception sits on the offending line as `eslint-disable-next-line <rule> -- <reason>` | Not enforced (judgment call; the human approves it in review)                                              |

## Important Patterns

### Japanese Text Linting

- textlint rules configured in `.textlintrc`
- Enforces technical writing standards for Japanese content
- Requires spaces between half-width and full-width characters
- Exclamation/question marks allowed (rule disabled)

### Repository Pattern

- Posts accessed via `src/lib/repositories/posts.ts`
- Abstracts Astro content collection API

### Date Handling

- Custom JST date utility in `src/lib/cdate-jst.ts`
- Uses `cdate` library for date formatting

## RSS Feed

- Generated at `/rss.xml` from `src/pages/rss.xml.ts`
- Includes all published posts

## Static Site Generation

- All routes pre-rendered at build time
- Dynamic routes: `/posts/[id]`, `/tags/[tag]`, `/og/[slug].png`
- Prefetching enabled with viewport strategy
