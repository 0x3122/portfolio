import { champion, RiotError } from "@/lib/riot";
export const runtime = "nodejs";
export const maxDuration = 600;
export async function GET() {
  try { return Response.json(await champion()); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Champion lookup failed." }, { status: error instanceof RiotError ? error.status : 503 }); }
}
