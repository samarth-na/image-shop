# AGENTS.md

- Repo: single Next.js 16.2.3 App Router app at the repo root.
- Main UI entrypoint is `app/page.tsx`; root shell is `app/layout.tsx`.
- `reactCompiler: true` is enabled in `next.config.ts`.
- Use `bun run dev`, `bun run build`, `bun run lint`, and `bun run format`.
- `bun run lint` runs `biome check`; `bun run format` runs `biome format --write`.
- Biome is the formatter/linter here, with 2-space indentation and organize-imports enabled.
- There is no `test` script.
- Image workflow API routes live under `app/api/images/*`; presets are in `app/api/presets/*`; recent settings are in `app/api/recent-settings`; health is `app/api/health`.
- Shared backend logic lives in `lib/backend/image-pipeline.ts`, `schemas.ts`, `errors.ts`, `types.ts`, `presets.ts`, `recent-settings.ts`, and `storage.ts`.
- Uploaded files are written to `.image-shop-data/inputs`.
- File metadata is cached in memory in `lib/backend/storage.ts`; restart clears that cache.
- If Next behavior seems off, check the installed docs in `node_modules/next/dist/docs/`.
- For UI/design work, follow the project design context in `.github/copilot-instructions.md`.
