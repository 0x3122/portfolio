import "server-only";

export const riotId = { name: "SHin4suRA", tag: "OC" };
export class RiotError extends Error {
  constructor(public status: number) { super(status === 403 || status === 401 ? "Riot API key expired or rejected. Update the server’s RIOT_API_KEY." : status === 404 ? "Player not found on OCE." : status === 429 ? "Riot’s request limit was reached. Please try again later." : "Riot is unavailable. Please try again."); }
}
let nextRequest = 0;
let blockedUntil = 0;
export async function riot<T>(host: "americas" | "sea" | "oc1", path: string, retried = false): Promise<T> {
  const key = process.env.RIOT_API_KEY;
  if (!key) throw new Error("Add RIOT_API_KEY to the server environment to connect to Riot.");
  if (Date.now() < blockedUntil) await new Promise(resolve => setTimeout(resolve, blockedUntil - Date.now()));
  const slot = Math.max(Date.now(), nextRequest);
  nextRequest = slot + 1500;
  await new Promise(resolve => setTimeout(resolve, Math.max(0, slot - Date.now())));
  if (Date.now() < blockedUntil) await new Promise(resolve => setTimeout(resolve, blockedUntil - Date.now()));
  const response = await fetch(`https://${host}.api.riotgames.com${path}`, { headers: { "X-Riot-Token": key }, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    if (response.status === 429) {
      blockedUntil = Date.now() + Math.max(1, Number(response.headers.get("Retry-After")) || 120) * 1000;
      if (!retried) return riot<T>(host, path, true);
    }
    throw new RiotError(response.status);
  }
  return response.json() as Promise<T>;
}
export type Rank = { queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number };
export type Player = { name: string; tag: string; level: number; ranks: Rank[]; updated: string };
let accountCache: { puuid: string; gameName: string; tagLine: string } | undefined;
export async function account() {
  if (!accountCache) accountCache = await riot<{ puuid: string; gameName: string; tagLine: string }>("americas", `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(riotId.name)}/${riotId.tag}`);
  return accountCache;
}
let playerCache: { data: Player; expires: number } | undefined;
let pendingPlayer: Promise<Player> | undefined;
export function player(): Promise<Player> {
  if (playerCache && playerCache.expires > Date.now()) return Promise.resolve(playerCache.data);
  if (pendingPlayer) return pendingPlayer;
  pendingPlayer = (async () => {
    const a = await account();
    const [summoner, ranks] = await Promise.all([
      riot<{ summonerLevel: number }>("oc1", `/lol/summoner/v4/summoners/by-puuid/${a.puuid}`),
      riot<Rank[]>("oc1", `/lol/league/v4/entries/by-puuid/${a.puuid}`),
    ]);
    const data = { name: a.gameName, tag: a.tagLine, level: summoner.summonerLevel, ranks, updated: new Date().toISOString() };
    playerCache = { data, expires: Date.now() + 300000 };
    return data;
  })().finally(() => { pendingPlayer = undefined; });
  return pendingPlayer;
}
export type Champion = { names: string[]; games: number; total: number; updated: string };
const matchChampions = new Map<string, string>();
let championCache: { data: Champion; expires: number } | undefined;
let pendingChampion: Promise<Champion> | undefined;
export function champion(): Promise<Champion> {
  if (championCache && championCache.expires > Date.now()) return Promise.resolve(championCache.data);
  if (pendingChampion) return pendingChampion;
  pendingChampion = (async () => {
    const a = await account();
    const ids = await riot<string[]>("sea", `/lol/match/v5/matches/by-puuid/${a.puuid}/ids?start=0&count=100&type=ranked`);
    const counts = new Map<string, number>();
    for (const id of ids) {
      let championName = matchChampions.get(id);
      if (!championName) {
      const match = await riot<{ info: { participants: { puuid: string; championName: string }[] } }>("sea", `/lol/match/v5/matches/${encodeURIComponent(id)}`);
      const participant = match.info.participants.find(p => p.puuid === a.puuid);
      if (!participant) throw new Error("A match was missing the player. Please try again.");
      championName = participant.championName;
      matchChampions.set(id, championName);
      }
      counts.set(championName, (counts.get(championName) ?? 0) + 1);
    }
    const games = Math.max(0, ...counts.values());
    const data = { names: [...counts].filter(([, n]) => n === games).map(([name]) => name), games, total: ids.length, updated: new Date().toISOString() };
    championCache = { data, expires: Date.now() + 900000 };
    return data;
  })().finally(() => { pendingChampion = undefined; });
  return pendingChampion;
}
