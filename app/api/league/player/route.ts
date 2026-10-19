import { player, RiotError } from "@/lib/riot";
export const runtime = "nodejs";
export async function GET() {
  try { return Response.json(await player()); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Player lookup failed." }, { status: error instanceof RiotError ? error.status : 503 }); }
}
