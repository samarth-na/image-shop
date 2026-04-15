import { listRecentSettings } from "@/lib/backend/recent-settings";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return Response.json({ recentSettings: listRecentSettings() });
}
