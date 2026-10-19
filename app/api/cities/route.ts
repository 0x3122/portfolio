import { weatherService } from "@/lib/weather-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim() ?? "";
  if (name.length < 2 || name.length > 100) return Response.json({ error: "Invalid city name" }, { status: 400 });
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name, count: "5", language: "en", format: "json" }).toString();
  try { return Response.json(await weatherService(url), { headers: { "Cache-Control": "public, max-age=300" } }); }
  catch (error) { console.error("City search failed:", error); return Response.json({ error: "City search unavailable" }, { status: 502 }); }
}
