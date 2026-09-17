# create-post

Run `pnpm create-post` from the repository root to enter a title, slug, and tags interactively. The generated post opens in VS Code.

For non-interactive use, supply a title, slug, and at least one tag:

```sh
pnpm create-post --title 'My new post' --slug my-new-post --tag Develop --tag JavaScript --no-open
```

- `--tag` can be repeated.
- `--output-dir /absolute/path` writes to an existing directory instead of `src/content/posts`. Relative paths resolve from `tools/create-post`, where pnpm runs the script.
- `--no-open` skips opening VS Code.
- Partial non-interactive arguments, invalid slugs, and duplicate slugs fail with a nonzero exit code. Existing posts are never overwritten.

Run `pnpm exec vitest run tools/create-post` to check the utilities and CLI. The CLI integration tests execute the real `pnpm create-post` command, generate posts in temporary directories, and clean them up afterward. They run automatically in the existing CI `Test with Coverage` step (`pnpm test:coverage`).
