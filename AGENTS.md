# AGENTS.md

- This repo uses Next.js 16.2.3 with App Router; check `node_modules/next/dist/docs/` if framework behavior seems off.
- `reactCompiler: true` is enabled in `next.config.ts`.
- `npm run lint` runs `biome check`; `npm run format` runs `biome format --write`; `npm run build` is the production verification. There is no `test` script.
- Biome is the repo formatter/linter, with 2-space indentation and organize-imports enabled.
- The app is a single Next.js app at the repo root; the main UI entrypoints are `app/page.tsx` and `app/ui/page.tsx`.
- Image workflow routes are split by concern: `app/api/images/inspect`, `preview`, `estimate`, `process`, and `export`.
- Uploaded files are written under `.image-shop-data/inputs`, and file metadata is cached in-memory in `lib/backend/storage.ts`; a restart clears that cache.
- Shared image transform logic lives in `lib/backend/image-pipeline.ts`; request schemas in `lib/backend/schemas.ts`; shared error handling in `lib/backend/errors.ts`; shared types in `lib/backend/types.ts`.
- Presets are handled by `app/api/presets/route.ts` and `app/api/presets/[presetId]/route.ts`, with persistence in `lib/backend/presets.ts`.
- Recent settings persistence lives in `lib/backend/recent-settings.ts`.
