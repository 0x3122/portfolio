import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "App 1",
  description: "Your first app. Coming soon.",
};

export default function AppOne() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 py-8">
      <Link
        href="/"
        className="text-sm text-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        ← my apps
      </Link>
      <h1 className="mt-10 text-3xl">App 1</h1>
      <p className="mt-3 text-white/60">Your first app. Coming soon.</p>
    </main>
  );
}
