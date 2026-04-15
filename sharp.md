# Best Node.js image manipulation library for your use case

Short answer: **use `sharp`**.

For the exact tasks you listed, `sharp` is the best Node.js choice today for most production apps (speed, quality, format support, memory efficiency).

## Why `sharp` fits your list

- **Format conversion**: JPEG, PNG, WebP, AVIF (read/write support across modern formats)
- **Compression**: strong controls for lossy/lossless output (`quality`, `compressionLevel`, effort settings)
- **Resize / thumbnails / responsive variants**: excellent resizing API + batch generation
- **Cropping**: manual extract crop + smart/center/aspect-ratio style resizing
- **Rotation / flipping / phone EXIF orientation fix**: `rotate()` auto-orients from EXIF, plus `flip()` / `flop()`
- **Performance**: backed by `libvips`; docs claim resizing is typically faster than ImageMagick/GraphicsMagick in common scenarios

## Minimal examples (`sharp`)

```bash
npm i sharp
```

```js
import sharp from "sharp";

// 1) Convert + compress
await sharp("input.jpg")
  .webp({ quality: 80 })      // or .avif({ quality: 50 }), .png(), .jpeg()
  .toFile("out.webp");

// 2) Thumbnail
await sharp("input.jpg")
  .resize(100, 100, { fit: "cover" })
  .toFile("thumb.jpg");

// 3) Responsive images
const widths = [320, 640, 1024];
await Promise.all(
  widths.map((w) =>
    sharp("input.jpg")
      .resize({ width: w })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(`image-${w}.jpg`)
  )
);

// 4) Manual crop
await sharp("input.jpg")
  .extract({ left: 100, top: 80, width: 400, height: 400 })
  .toFile("crop.jpg");

// 5) Center / aspect crop (1:1 avatar)
await sharp("input.jpg")
  .resize(300, 300, { fit: "cover", position: "centre" })
  .toFile("avatar.jpg");

// 6) Fix phone orientation + flip
await sharp("phone-upload.jpg")
  .rotate()   // auto-rotate using EXIF orientation
  .flip()     // vertical flip (optional)
  .toFile("fixed.jpg");
```

## When not to pick `sharp`

If you **must avoid native modules** and want pure JS only, look at `jimp`—but it’s generally slower and less suited for high-throughput image pipelines.

## Sources

- Sharp docs: https://sharp.pixelplumbing.com/
- Sharp GitHub README: https://github.com/lovell/sharp
- Jimp docs: https://jimp-dev.github.io/jimp/
