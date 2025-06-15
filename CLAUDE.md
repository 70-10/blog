# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development

- `pnpm dev` or `pnpm start` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Linting and Formatting

- `pnpm lint` - Run all linting (ESLint, Prettier, textlint)
- `pnpm fix` - Auto-fix all linting issues
- `pnpm lint:eslint` - ESLint only
- `pnpm lint:prettier` - Prettier check only
- `pnpm lint:textlint` - Textlint for markdown files only

### Testing

- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with UI interface
- `pnpm test -- --coverage` - Run tests with coverage report

### Content Creation

- `pnpm create-post` - Interactive tool to create new blog posts

## Architecture

This is an Astro-based blog with the following key components:

### Content Management

- Posts are stored as markdown files in `src/content/posts/`
- Content is managed via Astro's Content Collections API (`src/content.config.ts`)
- Post schema includes: title, publishDate, tags, optional description
- Images are stored in `src/content/images/` organized by post topic

### Key Directories

- `src/components/` - Astro and React components
- `src/layouts/` - Page layouts (main Layout.astro, MarkdownLayout.astro)
- `src/lib/repositories/` - Data access layer for posts
- `src/pages/` - Route pages including OG image generation
- `tools/` - Custom utilities (post creation tool, remark plugins)

### Styling

- Uses Tailwind CSS v4 with custom Vite plugin integration
- GitHub Markdown CSS for post content styling
- Custom global CSS in `src/styles/`

### Features

- RSS feed generation (`src/pages/rss.xml.ts`)
- Dynamic OG image generation using Satori (`src/pages/og/[slug].png.ts`)
- Tag-based post filtering
- Reading progress bar component
- Google Analytics 4 integration via Partytown

### Custom Remark Plugins

- `tools/remark-ogp-card/` - Custom OGP card generation for external links
- Uses `remark-code-titles` for code block titles

The codebase uses pnpm workspaces with separate tools having their own package.json files.

## Coding Guidelines

### Package Management

- **Always use exact versions when installing new packages** - Use `pnpm add -DE` to install dev dependencies with exact versions
- This ensures reproducible builds and prevents unexpected version conflicts

### TypeScript

- **Never use `any` type** - Always use specific types, `unknown`, or proper generic constraints
- Use `Record<string, unknown>` for object types with unknown structure
- Use union types, interfaces, or type aliases for better type safety

### Comments

- **Only add comments when absolutely necessary** - specifically when implementing something unavoidable or non-obvious that requires explanation of the "why"
- **All code comments must be written in English**
- Avoid redundant comments that simply describe what the code does
- Focus on explaining the reasoning behind complex or workaround implementations
