import { champion, RiotError } from "@/lib/riot";
export const runtime = "nodejs";
export const maxDuration = 600;
export async function GET() {
  if (process.env.VERCEL === "1" || process.env.RIOT_SNAPSHOT_MODE === "1") return Response.json({ error: "Live Riot access is disabled for the public snapshot demo." }, { status: 403 });
  try { return Response.json(await champion()); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Champion lookup failed." }, { status: error instanceof RiotError ? error.status : 503 }); }
}
