import { jsonError } from "@/lib/backend/errors";
import { storeUpload } from "@/lib/backend/storage";
import { SUPPORTED_OUTPUT_FORMATS } from "@/lib/backend/types";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function fileWarnings(mimeType: string, hasAlpha: boolean): string[] {
  const warnings: string[] = [];

  if (mimeType === "image/jpeg" && hasAlpha) {
    warnings.push("jpeg_removes_transparency");
  }

  return warnings;
}

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "bad_request", "Expected multipart/form-data body");
  }

  const fileField = formData.get("file");
  if (!(fileField instanceof File)) {
    return jsonError(400, "missing_file", "'file' field is required");
  }

  if (fileField.size === 0) {
    return jsonError(400, "empty_file", "Uploaded file is empty");
  }

  if (fileField.size > MAX_UPLOAD_BYTES) {
    return jsonError(413, "file_too_large", "File exceeds 25MB limit", {
      limitBytes: MAX_UPLOAD_BYTES,
      actualBytes: fileField.size,
    });
  }

  if (!fileField.type.startsWith("image/")) {
    return jsonError(
      415,
      "unsupported_type",
      "Only image uploads are allowed",
      {
        mimeType: fileField.type || "unknown",
      },
    );
  }

  try {
    const stored = await storeUpload(fileField);

    return Response.json({
      imageId: stored.id,
      input: {
        name: stored.originalName,
        mimeType: stored.mimeType,
        bytes: stored.bytes,
        width: stored.width,
        height: stored.height,
        format: stored.format,
        hasAlpha: stored.hasAlpha,
        orientation: stored.orientation,
      },
      supportedFormats: SUPPORTED_OUTPUT_FORMATS,
      warnings: fileWarnings(stored.mimeType, stored.hasAlpha),
      status: "ready",
    });
  } catch (error) {
    return jsonError(400, "invalid_image", "Unable to decode uploaded image", {
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
