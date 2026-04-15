# UI elements needed to manage image operations

For an image-processing UI that covers all those operations, use simple defaults + advanced controls.

## 1) File Input & Queue

- **Upload zone** (drag & drop + browse)
- **File list/queue** (name, size, type, dimensions, status)
- **Bulk select** + remove/reorder
- Optional: **batch mode toggle** (“Apply same settings to all”)

## 2) Live Preview Area

- **Before / After preview** (split slider or side-by-side)
- **Zoom controls** (fit, 100%, pan)
- **Metadata display** (dimensions, format, size)
- **Estimated output size** + % reduction

## 3) Format Conversion Panel

- **Output format selector** (JPG / PNG / WebP / AVIF)
- **Compatibility hint** (e.g., “AVIF not supported in older browsers”)
- **Transparency warning** (JPG removes alpha)

## 4) Compression Controls

- **Mode selector**: Lossy / Lossless
- **Quality slider** (for JPG/WebP/AVIF)
- **Compression level slider** (for PNG)
- **“Auto optimize” toggle** (recommended defaults)

## 5) Resize / Scaling Controls

- **Resize mode**:
  - By width/height
  - By percentage
  - Presets (thumbnail, social, etc.)
- **Aspect ratio lock**
- **Fit mode selector** (`cover`, `contain`, `inside`, `outside`)
- **Responsive sizes manager** (chips/table: 320, 640, 1024…)

## 6) Crop Controls

- **Interactive crop box** on preview
- **Aspect ratio presets** (1:1, 4:3, 16:9, freeform)
- **Position selector** (center, top, face/manual focal point)
- **Numeric crop inputs** (x, y, width, height)

## 7) Rotate / Flip / Orientation

- **Rotate buttons** (±90°) + angle input
- **Flip horizontal / vertical toggles**
- **Auto-orient toggle** (“Fix phone EXIF orientation”)

## 8) Output & Export

- **Output naming pattern** (`{name}-{width}.{ext}`)
- **Destination choice** (download zip, save folder, cloud bucket)
- **Overwrite / keep originals toggle**
- **Export button** + progress bar + success/error toasts

## Quality-of-life UX elements (recommended)

- **Presets** (“Web optimized”, “Avatar 1:1”, “High quality print”)
- **Reset section / reset all**
- **Undo/redo** for edit operations
- **Operation order timeline** (resize → crop → compress)
- **Validation messages** (“Width required”, “PNG lossless only”, etc.)
- **Keyboard shortcuts** (crop, zoom, rotate)
- **History of recent settings**

## Suggested layout

- **Left:** operation panels (accordion/tabs)
- **Center:** preview canvas
- **Right/top:** output summary (final format, dimensions, estimated size)
- **Bottom:** queue + export progress
