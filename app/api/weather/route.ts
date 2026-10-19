import { weatherService } from "@/lib/weather-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = params.get("latitude");
  const lon = params.get("longitude");
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!lat?.trim() || !lon?.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code", daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max", timezone: "auto", forecast_days: "7" }).toString();
  try { return Response.json(await weatherService(url), { headers: { "Cache-Control": "private, max-age=120" } }); }
  catch (error) { console.error("Forecast request failed:", error); return Response.json({ error: "Weather unavailable" }, { status: 502 }); }
}
