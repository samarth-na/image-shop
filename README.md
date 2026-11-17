# Image Shop

A full-stack image editor that processes files locally: upload a batch, resize, crop, rotate, convert, compress, and export as a ZIP.

No account, no cloud storage, and no external processing service — `sharp` does the work on the server that runs the app.

## Features

- Drag-and-drop upload queue with before/after preview and estimated output size.
- Resize by dimensions, percentage, or presets (thumbnail 200px, social 1200×630, HD 1920) with four fit modes.
- Crop to 1:1, 4:3, 16:9, or freeform, with numeric inputs.
- Rotate by ±90° or a custom angle, flip, flop, and EXIF auto-orientation.
- Convert to JPEG, PNG, WebP, or AVIF with automatic quality settings (52/78/82) and lossy/lossless control.
- Built-in presets (`web-optimized`, `avatar-1-1`) plus recent settings.
- ZIP export with a configurable naming pattern.

## Tech stack

- Next.js 16.2.3 (App Router), React 19.2.4, TypeScript 5
- `sharp` 0.34.4 for processing, JSZip 3.10.1 for export, Zod 4.1.12 for validation
- Radix UI and shadcn/ui, Tailwind CSS 4, next-themes, sonner
- Biome for lint and format; Bun as the package manager

## Requirements

- Bun 1.3 or newer
- No environment variables or external services are required. Uploads are written under `.image-shop-data/inputs`.

## Quick start

```bash
bun install
bun run dev
# http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Production build |
| `bun run start` | Start the production server |
| `bun run lint` | Biome check |
| `bun run format` | Biome format and write |

There is no test script yet.

## API

Nine routes back the UI:

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Service status |
| `POST /api/images/inspect` | Read image metadata |
| `POST /api/images/estimate` | Estimate output size |
| `POST /api/images/preview` | Generate a before/after preview |
| `POST /api/images/process` | Apply the selected operations |
| `POST /api/images/export` | Package results into a ZIP |
| `GET /api/presets` | List presets |
| `GET /api/presets/[presetId]` | Get one preset |
| `GET /api/recent-settings` | Load recent settings |

All request bodies are validated with Zod. The schema also allows `folder` and `cloud` export destinations, but only `zip` is implemented; the others return `destination_not_implemented`.

## Status and contributions

This repository has no license and no CONTRIBUTING guide, and issues are not an active contribution channel. Treat it as a portfolio project rather than an open one. If you want outside contributions, add a `LICENSE`, a short CONTRIBUTING file, and tests around the processing pipeline.
