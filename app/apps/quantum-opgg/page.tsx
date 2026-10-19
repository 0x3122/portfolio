import type { Metadata } from "next";
import Player from "./player";
export const metadata: Metadata = { title: "Quantum OPGG · SHin4suRA", description: "An OCE League of Legends player profile." };
export default function QuantumOpggPage() { return <Player />; }
