"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Place = { name: string; latitude: number; longitude: number; country?: string; admin1?: string };
type Forecast = {
  current: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number; time: string };
  daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; weather_code: number[] };
};
const melbourne: Place = { name: "Melbourne", country: "Australia", latitude: -37.814, longitude: 144.9633 };
function conditions(code: number): [string, string] {
  if (code === 0) return ["Clear skies", "☀"];
  if (code < 3) return ["Partly cloudy", "🌤"];
  if (code === 3) return ["Overcast", "☁"];
  if (code < 50) return ["Foggy", "🌫"];
  if (code < 60) return ["Drizzle", "🌦"];
  if (code < 70) return ["Rain", "🌧"];
  if (code < 80) return ["Snow", "❄"];
  if (code < 85) return ["Rain showers", "🌧"];
  if (code < 90) return ["Snow showers", "❄"];
  return ["Thunderstorms", "⛈"];
}
const rounded = (n: number) => Math.round(n);

export default function Weather() {
  const [place, setPlace] = useState<Place>(melbourne);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [sample, setSample] = useState(false);
  const [retry, setRetry] = useState(0);
  const searchRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ latitude: String(place.latitude), longitude: String(place.longitude), current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code", daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max", timezone: "auto", forecast_days: "7" });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]) })
      .then(async response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => { if (!data.current || data.daily?.time?.length !== 7) throw new Error(); setForecast(data); })
      .catch(() => { if (!controller.signal.aborted) setError("Weather is unavailable right now. Please try again."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [place, retry]);

  useEffect(() => () => searchRequest.current?.abort(), []);

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setResults([]);
    setSearchError("");
    if (query.trim().length < 2) { setSearchError("Enter at least two letters of a city name."); return; }
    setSearching(true);
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: query.trim(), count: "5", language: "en", format: "json" })}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResults(data.results ?? []);
      if (!data.results?.length) setSearchError("No cities found. Try a nearby city or another spelling.");
    } catch { if (!controller.signal.aborted) setSearchError("City search is unavailable. Please try again."); }
    finally { if (!controller.signal.aborted) setSearching(false); }
  }

  function choosePlace(next: Place) {
    setLoading(true);
    setError("");
    setForecast(null);
    setSample(false);
    setPlace(next);
    setResults([]);
    setQuery("");
  }

  function locate() {
    setSearchError("");
    if (!navigator.geolocation) { setSearchError("Location is unavailable in this browser. Search for a city instead."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(position => {
      choosePlace({ name: "Your location", latitude: position.coords.latitude, longitude: position.coords.longitude });
      setResults([]);
      setLocating(false);
    }, () => { setLocating(false); setSearchError("Could not access your location. Check browser permissions or search for a city."); }, { timeout: 10000, maximumAge: 300000 });
  }

  function previewSample() {
    setSample(true);
    setError("");
    setForecast({
      current: { temperature_2m: 21, apparent_temperature: 20, relative_humidity_2m: 62, wind_speed_10m: 14, weather_code: 2, time: "Sample data" },
      daily: {
        time: Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }),
        temperature_2m_max: [23, 25, 22, 20, 19, 22, 24], temperature_2m_min: [14, 15, 13, 12, 11, 13, 14],
        precipitation_probability_max: [10, 5, 40, 75, 60, 20, 10], weather_code: [2, 0, 3, 63, 61, 2, 0],
      },
    });
  }

  const current = forecast?.current;
  return (
    <main className="weather-shell min-h-dvh px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="weather-link rounded-lg px-2 py-3 text-sm">← home</Link>
          <span className="text-xs tracking-[0.2em] text-cyan-200/70">A LITTLE CLARITY, EVERY DAY</span>
        </header>
        <div className="mb-8 mt-8 sm:mt-12">
          <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-cyan-300">YOUR DAILY OUTLOOK</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Quantum Weather App<span className="text-cyan-300">.</span></h1>
          <p className="mt-3 text-slate-400">Find your city. See what’s ahead.</p>
        </div>
        <section aria-label="Find a location" className="mb-6">
          <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="city" className="sr-only">City name</label>
            <input id="city" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a city…" autoComplete="off" maxLength={100} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-slate-500" />
            <button type="submit" disabled={searching} className="rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60">{searching ? "Searching…" : "Search"}</button>
            <button type="button" onClick={locate} disabled={locating} className="rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-60">{locating ? "Locating…" : "◎ Use my location"}</button>
          </form>
          <p className="mt-2 text-xs text-slate-500">Location is optional. Coordinates are shared with Open-Meteo only when you choose this option.</p>
          {searchError && <p role="alert" className="mt-3 text-sm text-amber-200">{searchError}</p>}
          {results.length > 0 && <ul aria-label="City results" className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-slate-900">{results.map(p => <li key={`${p.latitude},${p.longitude}`}><button onClick={() => { choosePlace(p); }} className="w-full border-b border-white/5 px-4 py-3 text-left hover:bg-white/10"><span className="font-medium">{p.name}</span><span className="ml-2 text-sm text-slate-400">{[p.admin1, p.country].filter(Boolean).join(", ")}</span></button></li>)}</ul>}
        </section>
        <div aria-live="polite" aria-busy={loading}>
          {loading && <div className="weather-panel flex min-h-72 items-center justify-center text-slate-300">Loading weather for {place.name}…</div>}
          {error && <div role="alert" className="weather-panel p-8"><p>{error}</p><button onClick={() => { setSample(false); setForecast(null); setLoading(true); setError(""); setRetry(n => n + 1); }} className="mt-4 rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Try again</button><button onClick={previewSample} className="ml-3 mt-4 rounded-lg border border-white/20 px-5 py-3">Preview sample weather</button></div>}
          {forecast && current && <>
            {sample && <p role="status" className="mb-4 rounded-xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm text-amber-100">Sample preview — these are illustrative values, not a live forecast. Search for a city to load real weather.</p>}
            <section aria-label="Current weather" className="weather-panel p-6 sm:p-10">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs tracking-widest text-cyan-200">CURRENT CONDITIONS</p><h2 className="mt-2 text-2xl font-medium sm:text-3xl">{place.name}</h2><p className="mt-1 text-sm text-slate-400">{place.country ?? "Local forecast"}</p></div>
                <span aria-hidden="true" className="text-5xl sm:text-7xl">{conditions(current.weather_code)[1]}</span>
              </div>
              <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3"><p className="text-7xl font-light tracking-tighter sm:text-8xl">{rounded(current.temperature_2m)}<span className="align-top text-3xl text-cyan-200">°C</span></p><div className="pb-2"><p className="text-lg">{conditions(current.weather_code)[0]}</p><p className="text-sm text-slate-400">Feels like {rounded(current.apparent_temperature)}°</p></div></div>
              <dl className="mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-6 text-sm"><div><dt className="text-slate-400">Humidity</dt><dd className="mt-2 text-lg">{current.relative_humidity_2m}%</dd></div><div><dt className="text-slate-400">Wind</dt><dd className="mt-2 text-lg">{rounded(current.wind_speed_10m)} <span className="text-xs text-slate-400">km/h</span></dd></div><div><dt className="text-slate-400">Rain today</dt><dd className="mt-2 text-lg">{forecast.daily.precipitation_probability_max[0] ?? "—"}%</dd></div></dl>
              <p className="mt-5 text-xs text-slate-500">{sample ? "Illustrative sample data" : `Model update ${current.time.replace("T", " · ")} · local time`}</p>
            </section>
            <section className="mt-8" aria-labelledby="forecast-title"><div className="mb-4 flex items-center justify-between"><h2 id="forecast-title" className="text-lg font-medium">The next 7 days</h2><span className="text-xs text-slate-500">High / Low · °C</span></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-7">{forecast.daily.time.map((date, i) => <article key={date} className="weather-panel flex items-center justify-between gap-2 px-4 py-4 sm:flex-col sm:px-2 sm:py-5"><h3 className="w-16 text-sm font-medium sm:w-auto">{i === 0 ? "Today" : new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "short" })}</h3><span aria-label={conditions(forecast.daily.weather_code[i])[0]} className="text-2xl">{conditions(forecast.daily.weather_code[i])[1]}</span><p className="min-w-20 text-right text-sm sm:min-w-0"><span>{rounded(forecast.daily.temperature_2m_max[i])}°</span><span className="ml-2 text-slate-500">{rounded(forecast.daily.temperature_2m_min[i])}°</span></p><p className="w-12 text-right text-xs text-cyan-200/80 sm:w-auto">{forecast.daily.precipitation_probability_max[i] ?? "—"}%<span className="sr-only"> chance of rain</span></p></article>)}</div></section>
          </>}
        </div>
        <footer className="mt-8 flex flex-wrap justify-between gap-3 pb-4 text-xs text-slate-500"><p>Weather, without the noise.</p><a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-4">Weather data by Open-Meteo · Cities by GeoNames</a></footer>
      </div>
    </main>
  );
}
