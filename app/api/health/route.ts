export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    service: "image-shop-backend",
    timestamp: new Date().toISOString(),
  });
}
