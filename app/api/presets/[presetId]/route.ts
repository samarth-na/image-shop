import { jsonError } from "@/lib/backend/errors";
import { removePreset, updatePreset } from "@/lib/backend/presets";
import { presetSchema } from "@/lib/backend/schemas";

type Params = { params: Promise<{ presetId: string }> };

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: Params,
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "bad_request", "Expected JSON payload");
  }

  const parsed = presetSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(422, "validation_failed", "Invalid preset payload", {
      issues: parsed.error.issues,
    });
  }

  const { presetId } = await context.params;
  const updated = updatePreset(
    presetId,
    parsed.data.name,
    parsed.data.operations,
  );
  if (!updated) {
    return jsonError(404, "preset_not_found", "Preset not found");
  }

  return Response.json({ preset: updated });
}

export async function DELETE(
  _request: Request,
  context: Params,
): Promise<Response> {
  const { presetId } = await context.params;
  const deleted = removePreset(presetId);
  if (!deleted) {
    return jsonError(404, "preset_not_found", "Preset not found");
  }

  return new Response(null, { status: 204 });
}
