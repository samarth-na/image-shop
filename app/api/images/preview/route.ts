import { jsonError } from "@/lib/backend/errors";
import { applyOperations, formatMimeType } from "@/lib/backend/image-pipeline";
import { previewSchema } from "@/lib/backend/schemas";
import { getStoredImage } from "@/lib/backend/storage";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "bad_request", "Expected JSON payload");
  }

  const parsed = previewSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(422, "validation_failed", "Invalid preview payload", {
      issues: parsed.error.issues,
    });
  }

  const image = getStoredImage(parsed.data.imageId);
  if (!image) {
    return jsonError(404, "image_not_found", "Image ID not found");
  }

  try {
    const result = await applyOperations(image, parsed.data.operations ?? {});

    return new Response(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": formatMimeType(result.format),
        "Cache-Control": "no-store",
        "X-Image-Width": String(result.width),
        "X-Image-Height": String(result.height),
        "X-Image-Bytes": String(result.bytes),
        "X-Image-Format": result.format,
        "X-Image-Warnings": result.warnings.join(","),
      },
    });
  } catch (error) {
    return jsonError(400, "preview_failed", "Unable to generate preview", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
