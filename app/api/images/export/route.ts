import JSZip from "jszip";
import { jsonError } from "@/lib/backend/errors";
import { applyOperations } from "@/lib/backend/image-pipeline";
import { exportSchema } from "@/lib/backend/schemas";
import { getStoredImage } from "@/lib/backend/storage";

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function extensionFromFormat(format: string): string {
  if (format === "jpeg") {
    return "jpg";
  }
  return format;
}

function compileOutputName(
  pattern: string,
  originalName: string,
  width: number,
  ext: string,
): string {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName =
    dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;

  return sanitizeName(
    pattern
      .replaceAll("{name}", baseName)
      .replaceAll("{width}", String(width))
      .replaceAll("{ext}", ext),
  );
}

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "bad_request", "Expected JSON payload");
  }

  const parsed = exportSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(422, "validation_failed", "Invalid export payload", {
      issues: parsed.error.issues,
    });
  }

  const { items, output } = parsed.data;

  if (output.destination !== "zip") {
    return jsonError(
      501,
      "destination_not_implemented",
      "Only 'zip' export is implemented right now",
    );
  }

  const zip = new JSZip();
  const files: Array<{ imageId: string; fileName: string; bytes: number }> = [];

  try {
    for (const item of items) {
      const image = getStoredImage(item.imageId);
      if (!image) {
        return jsonError(
          404,
          "image_not_found",
          `Image ${item.imageId} not found`,
        );
      }

      const result = await applyOperations(image, item.operations ?? {});
      const ext = extensionFromFormat(result.format);
      const fileName = compileOutputName(
        output.namingPattern,
        image.originalName,
        result.width,
        ext,
      );

      zip.file(fileName, result.buffer);
      files.push({ imageId: image.id, fileName, bytes: result.bytes });
    }

    const archiveBuffer = await zip.generateAsync({ type: "uint8array" });

    return new Response(archiveBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=processed-images.zip",
        "X-Export-Items": String(files.length),
      },
    });
  } catch (error) {
    return jsonError(400, "export_failed", "Unable to export images", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
