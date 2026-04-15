import { jsonError } from "@/lib/backend/errors";
import { applyOperations } from "@/lib/backend/image-pipeline";
import { estimateSchema } from "@/lib/backend/schemas";
import { getStoredImage } from "@/lib/backend/storage";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "bad_request", "Expected JSON payload");
  }

  const parsed = estimateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(422, "validation_failed", "Invalid estimate payload", {
      issues: parsed.error.issues,
    });
  }

  const image = getStoredImage(parsed.data.imageId);
  if (!image) {
    return jsonError(404, "image_not_found", "Image ID not found");
  }

  try {
    const result = await applyOperations(image, parsed.data.operations);

    const estimatedReductionPct = Math.round(
      (1 - result.bytes / image.bytes) * 100,
    );

    return Response.json({
      imageId: image.id,
      input: {
        bytes: image.bytes,
        width: image.width,
        height: image.height,
        format: image.format,
      },
      output: {
        format: result.format,
        width: result.width,
        height: result.height,
        estimatedBytes: result.bytes,
        estimatedReductionPct,
      },
      warnings: result.warnings,
    });
  } catch (error) {
    return jsonError(400, "estimate_failed", "Unable to estimate output", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
