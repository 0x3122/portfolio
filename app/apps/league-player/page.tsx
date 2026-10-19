import type { Metadata } from "next";
import Player from "./player";
export const metadata: Metadata = { title: "League Player · SHin4suRA", description: "An OCE League of Legends player profile." };
export default function LeaguePlayerPage() { return <Player />; }
