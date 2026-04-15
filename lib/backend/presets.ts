import type { ImageOperations } from "@/lib/backend/types";

export interface PresetRecord {
  id: string;
  name: string;
  operations: ImageOperations;
  createdAt: string;
  updatedAt: string;
}

const presets = new Map<string, PresetRecord>([
  [
    "web-optimized",
    {
      id: "web-optimized",
      name: "Web optimized",
      operations: {
        resize: { mode: "dimensions", width: 1200, fit: "inside" },
        convert: {
          format: "webp",
          quality: 78,
          autoOptimize: true,
          mode: "lossy",
        },
        orientation: { autoOrient: true },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "avatar-1-1",
    {
      id: "avatar-1-1",
      name: "Avatar 1:1",
      operations: {
        resize: { mode: "dimensions", width: 400, height: 400, fit: "cover" },
        convert: { format: "jpeg", quality: 85, mode: "lossy" },
        orientation: { autoOrient: true },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

export function listPresets(): PresetRecord[] {
  return [...presets.values()];
}

export function createPreset(
  name: string,
  operations: ImageOperations,
): PresetRecord {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record: PresetRecord = {
    id,
    name,
    operations,
    createdAt: now,
    updatedAt: now,
  };
  presets.set(id, record);
  return record;
}

export function updatePreset(
  id: string,
  name: string,
  operations: ImageOperations,
): PresetRecord | null {
  const existing = presets.get(id);
  if (!existing) {
    return null;
  }
  const updated: PresetRecord = {
    ...existing,
    name,
    operations,
    updatedAt: new Date().toISOString(),
  };
  presets.set(id, updated);
  return updated;
}

export function removePreset(id: string): boolean {
  return presets.delete(id);
}
