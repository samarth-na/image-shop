import type { ImageOperations } from "@/lib/backend/types";

export interface RecentSettingRecord {
  id: string;
  operations: ImageOperations;
  createdAt: string;
}

const recentSettings: RecentSettingRecord[] = [];
const LIMIT = 12;

export function pushRecentSetting(operations: ImageOperations): void {
  recentSettings.unshift({
    id: crypto.randomUUID(),
    operations,
    createdAt: new Date().toISOString(),
  });

  if (recentSettings.length > LIMIT) {
    recentSettings.length = LIMIT;
  }
}

export function listRecentSettings(): RecentSettingRecord[] {
  return [...recentSettings];
}
