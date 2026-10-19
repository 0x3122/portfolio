"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Champion, Player as Profile, Rank } from "@/lib/riot";

function rankLabel(rank?: Rank) {
  if (!rank) return "Unranked";
  const division = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rank.tier) ? "" : ` ${rank.rank}`;
  return `${rank.tier.charAt(0)}${rank.tier.slice(1).toLowerCase()}${division}`;
}
export default function Player() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mostPlayed, setMostPlayed] = useState<Champion | null>(null);
  const [error, setError] = useState("");
  const [championError, setChampionError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/league/player", { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setProfile(data);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Player lookup failed."); return; }
      try {
        const response = await fetch("/api/league/champion", { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMostPlayed(data);
      } catch (e) { if (!controller.signal.aborted) setChampionError(e instanceof Error ? e.message : "Champion lookup failed."); }
    }
    void load();
    return () => controller.abort();
  }, [retry]);
  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top_right,#272043,#080b13_60%)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-block rounded-lg py-3 text-sm text-slate-400 hover:text-white">← home</Link>
        <p className="mt-10 text-xs tracking-[0.25em] text-violet-300">LEAGUE OF LEGENDS · OCEANIA</p>
        <h1 className="mt-3 break-words text-4xl font-semibold tracking-tight sm:text-6xl">{profile?.name ?? "SHin4suRA"}<span className="text-violet-300">#{profile?.tag ?? "OC"}</span></h1>
        <p className="mt-4 text-slate-400">One player. The numbers behind the name.</p>
        <div aria-live="polite" className="mt-10">
          {error ? <p role="alert" className="rounded-xl border border-red-300/20 p-5 text-red-200">{error}</p> : !profile ? <p role="status" className="text-slate-400">Connecting to Riot…</p> : <>
            <div className="grid gap-4 sm:grid-cols-3">
              <section className="weather-panel p-6"><h2 className="text-sm text-slate-400">Summoner level</h2><p className="mt-4 text-4xl">{profile.level}</p></section>
              {[['Solo / Duo', 'RANKED_SOLO_5x5'], ['Ranked Flex', 'RANKED_FLEX_SR']].map(([label, queue]) => {
                const rank = profile.ranks.find(r => r.queueType === queue || (queue === 'RANKED_FLEX_SR' && r.queueType === 'RANKED_PREMADE_5x5'));
                return <section key={queue} className="weather-panel p-6"><h2 className="text-sm text-slate-400">{label}</h2><p className="mt-4 text-2xl text-violet-200">{rankLabel(rank)}</p>{rank && <><p className="mt-2 text-sm">{rank.leaguePoints} LP</p><p className="mt-2 text-xs text-slate-400">{rank.wins}W · {rank.losses}L</p></>}</section>;
              })}
            </div>
            <section className="weather-panel mt-4 p-6"><h2 className="text-sm text-slate-400">Most-played champion</h2><p className="mt-1 text-xs text-slate-500">Last 100 ranked matches · Solo/Duo and Flex</p>{championError ? <p role="alert" className="mt-4 text-amber-200">{championError}</p> : mostPlayed ? <><p className="mt-4 text-3xl text-violet-200">{mostPlayed.names.join(" / ") || "No ranked matches"}</p><p className="mt-2 text-sm text-slate-400">{mostPlayed.total > 0 ? `${mostPlayed.games} of ${mostPlayed.total} matches${mostPlayed.names.length > 1 ? ' · tied' : ''}` : "No matches available from Riot."}</p></> : <p role="status" className="mt-4 text-slate-300">Analyzing match history…<span className="mt-2 block text-sm text-slate-500">The first load takes around 3–5 minutes to respect Riot’s API limits.</span></p>}</section>
            <p className="mt-5 text-xs text-slate-500">Profile fetched {new Date(profile.updated).toLocaleString()} · Champion analysis cached for 15 minutes.</p>
          </>}
          {(error || championError) && <button onClick={() => { setError(""); setChampionError(""); setRetry(n => n + 1); }} className="mt-5 rounded-xl bg-violet-300 px-6 py-3 font-medium text-slate-950">Try again</button>}
        </div>
        <footer className="mt-12 border-t border-white/10 pt-5 text-xs leading-relaxed text-slate-500">Quantum OPGG isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</footer>
      </div>
    </main>
  );
}
