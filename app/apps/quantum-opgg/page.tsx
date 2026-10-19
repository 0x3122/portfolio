import type { Metadata } from "next";
import Link from "next/link";
import Player from "./player";
import snapshot from "@/lib/league-snapshot.json";

export const metadata: Metadata = { title: "Quantum OPGG · SHin4suRA", description: "An OCE League of Legends player profile." };

export default function QuantumOpggPage() {
  if (process.env.VERCEL !== "1" && process.env.RIOT_SNAPSHOT_MODE !== "1") return <Player />;
  const { profile, champion } = snapshot;
  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top_right,#272043,#080b13_60%)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-block rounded-lg py-3 text-sm text-slate-400 hover:text-white">← home</Link>
        <p className="mt-8 text-xs tracking-[0.2em] text-violet-300">QUANTUM OPGG · OCEANIA</p>
        <h1 className="mt-4 break-words text-4xl font-semibold sm:text-6xl">{profile.name}<span className="text-violet-300">#{profile.tag}</span></h1>
        <div className="mt-6 rounded-xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm leading-relaxed text-amber-100">
          Snapshot demo · Recorded on 19 October 2026. These stats do not update live. Live updates are pending Riot production API approval.
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <section className="weather-panel p-6"><h2 className="text-sm text-slate-400">Summoner level</h2><p className="mt-4 text-4xl">{profile.level}</p></section>
          {profile.ranks.map(rank => <section key={rank.queueType} className="weather-panel p-6">
            <h2 className="text-sm text-slate-400">{rank.queueType === "RANKED_SOLO_5x5" ? "Solo / Duo" : "Ranked Flex"}</h2>
            <p className="mt-4 text-2xl text-violet-200">{rank.tier.charAt(0) + rank.tier.slice(1).toLowerCase()}{["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rank.tier) ? "" : ` ${rank.rank}`}</p>
            <p className="mt-2 text-sm">{rank.leaguePoints} LP</p><p className="mt-2 text-xs text-slate-400">{rank.wins}W · {rank.losses}L</p>
          </section>)}
        </div>
        <section className="weather-panel mt-4 p-6"><h2 className="text-sm text-slate-400">Most-played champion</h2><p className="mt-1 text-xs text-slate-500">Last {champion.total} ranked matches at the time of recording</p><p className="mt-4 text-3xl text-violet-200">{champion.names.join(" / ")}</p><p className="mt-2 text-sm text-slate-400">{champion.games} of {champion.total} matches</p></section>
        <footer className="mt-10 border-t border-white/10 pt-5 text-xs leading-relaxed text-slate-500">Quantum OPGG isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</footer>
      </div>
    </main>
  );
}
