import { jsonError } from "@/lib/backend/errors";
import { createPreset, listPresets } from "@/lib/backend/presets";
import { presetSchema } from "@/lib/backend/schemas";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return Response.json({ presets: listPresets() });
}

export async function POST(request: Request): Promise<Response> {
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

  const preset = createPreset(parsed.data.name, parsed.data.operations);
  return Response.json({ preset }, { status: 201 });
}
