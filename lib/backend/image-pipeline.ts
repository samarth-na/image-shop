import { readFile } from "node:fs/promises";
import sharp, { type AvailableFormatInfo, type Sharp } from "sharp";
import type {
  AppliedImageResult,
  ImageOperations,
  OutputFormat,
  ResizeFit,
  StoredImage,
} from "@/lib/backend/types";

const MODERN_BROWSER_WARNING = "avif_legacy_browser_support";
const JPG_ALPHA_WARNING = "jpeg_removes_transparency";

const FORMAT_MIME: Record<OutputFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

const DEFAULT_FORMAT: OutputFormat = "webp";

function toOutputFormat(inputFormat: string): OutputFormat {
  if (inputFormat === "jpg") {
    return "jpeg";
  }
  if (
    inputFormat === "jpeg" ||
    inputFormat === "png" ||
    inputFormat === "webp" ||
    inputFormat === "avif"
  ) {
    return inputFormat;
  }
  return DEFAULT_FORMAT;
}

function applyResizeTransform(
  instance: Sharp,
  operations: ImageOperations,
  input: StoredImage,
): Sharp {
  const resize = operations.resize;
  if (!resize) {
    return instance;
  }

  const fit: ResizeFit = resize.fit ?? "inside";

  if (resize.mode === "percentage" && resize.percentage) {
    const scale = resize.percentage / 100;
    return instance.resize({
      width: Math.max(1, Math.round(input.width * scale)),
      height: Math.max(1, Math.round(input.height * scale)),
      fit,
    });
  }

  if (resize.mode === "preset") {
    if (resize.preset === "thumbnail") {
      return instance.resize({ width: 200, height: 200, fit: "cover" });
    }
    if (resize.preset === "social") {
      return instance.resize({ width: 1200, height: 630, fit: "cover" });
    }
    if (resize.preset === "hd") {
      return instance.resize({ width: 1920, fit: "inside" });
    }
  }

  return instance.resize({
    width: resize.width,
    height: resize.height,
    fit,
  });
}

function resolveAutoQuality(format: OutputFormat): number {
  if (format === "avif") {
    return 52;
  }
  if (format === "webp") {
    return 78;
  }
  if (format === "jpeg") {
    return 82;
  }
  return 100;
}

function applyOutputFormat(
  instance: Sharp,
  format: OutputFormat,
  operations: ImageOperations,
): Sharp {
  const convert = operations.convert;
  const mode = convert?.mode ?? "lossy";
  const quality = convert?.autoOptimize
    ? resolveAutoQuality(format)
    : convert?.quality;

  if (format === "jpeg") {
    return instance.jpeg({
      quality: quality ?? 82,
      mozjpeg: true,
      force: true,
    });
  }

  if (format === "png") {
    return instance.png({
      compressionLevel:
        convert?.compressionLevel ?? (mode === "lossless" ? 9 : 6),
      effort: convert?.effort ?? 7,
      force: true,
    });
  }

  if (format === "avif") {
    return instance.avif({
      quality: quality ?? 52,
      effort: convert?.effort ?? 4,
      force: true,
    });
  }

  return instance.webp({
    quality: quality ?? 78,
    effort: convert?.effort ?? 4,
    lossless: mode === "lossless",
    force: true,
  });
}

function operationWarnings(format: OutputFormat, hasAlpha: boolean): string[] {
  const warnings: string[] = [];

  if (format === "avif") {
    warnings.push(MODERN_BROWSER_WARNING);
  }

  if (format === "jpeg" && hasAlpha) {
    warnings.push(JPG_ALPHA_WARNING);
  }

  return warnings;
}

export function supportedFormats(): string[] {
  const formats = sharp.format;
  const supported: string[] = [];
  const entries = Object.entries(formats) as [string, AvailableFormatInfo][];

  for (const [name, info] of entries) {
    if (info.output) {
      if (name === "jpg") {
        supported.push("jpeg");
      } else if (
        name === "jpeg" ||
        name === "png" ||
        name === "webp" ||
        name === "avif"
      ) {
        supported.push(name);
      }
    }
  }

  return [...new Set(supported)];
}

export function formatMimeType(format: OutputFormat): string {
  return FORMAT_MIME[format];
}

export async function applyOperations(
  image: StoredImage,
  operations: ImageOperations = {},
): Promise<AppliedImageResult> {
  const source = await readFile(image.inputPath);

  let pipeline = sharp(source, { failOn: "none" });

  if (operations.orientation?.autoOrient) {
    pipeline = pipeline.rotate();
  }

  if (operations.rotate?.quarterTurns) {
    pipeline = pipeline.rotate(operations.rotate.quarterTurns * 90);
  }

  if (typeof operations.rotate?.angle === "number") {
    pipeline = pipeline.rotate(operations.rotate.angle);
  }

  if (operations.flip?.vertical) {
    pipeline = pipeline.flip();
  }

  if (operations.flip?.horizontal) {
    pipeline = pipeline.flop();
  }

  if (operations.crop) {
    pipeline = pipeline.extract({
      left: operations.crop.x,
      top: operations.crop.y,
      width: operations.crop.width,
      height: operations.crop.height,
    });
  }

  pipeline = applyResizeTransform(pipeline, operations, image);

  const outputFormat =
    operations.convert?.format ?? toOutputFormat(image.format);
  pipeline = applyOutputFormat(pipeline, outputFormat, operations);

  const outputBuffer = await pipeline.toBuffer();
  const outputMeta = await sharp(outputBuffer, { failOn: "none" }).metadata();

  return {
    buffer: outputBuffer,
    format: outputFormat,
    width: outputMeta.width ?? image.width,
    height: outputMeta.height ?? image.height,
    bytes: outputBuffer.byteLength,
    warnings: operationWarnings(outputFormat, image.hasAlpha),
  };
}
