import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import type { StoredImage } from "@/lib/backend/types";

const BASE_STORAGE_DIR = join(process.cwd(), ".image-shop-data");
const INPUTS_DIR = join(BASE_STORAGE_DIR, "inputs");

const imageStore = new Map<string, StoredImage>();

export async function ensureStorageDirs(): Promise<void> {
  await mkdir(INPUTS_DIR, { recursive: true });
}

export function getStoredImage(imageId: string): StoredImage | null {
  return imageStore.get(imageId) ?? null;
}

function normalizeFormat(format: string | undefined): string {
  if (!format) {
    return "unknown";
  }
  if (format === "jpg") {
    return "jpeg";
  }
  return format;
}

function resolveOrientation(
  exifOrientation: number | undefined,
): number | null {
  if (typeof exifOrientation === "number") {
    return exifOrientation;
  }
  return null;
}

export async function storeUpload(file: File): Promise<StoredImage> {
  await ensureStorageDirs();

  const imageId = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer, { failOn: "none" }).metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const format = normalizeFormat(metadata.format);
  const hasAlpha = Boolean(metadata.hasAlpha);
  const orientation = resolveOrientation(metadata.orientation);

  const inputPath = join(INPUTS_DIR, `${imageId}.input`);
  await writeFile(inputPath, buffer);

  const storedImage: StoredImage = {
    id: imageId,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    bytes: buffer.byteLength,
    width,
    height,
    format,
    hasAlpha,
    orientation,
    createdAt: new Date().toISOString(),
    inputPath,
  };

  imageStore.set(imageId, storedImage);

  return storedImage;
}
