import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 pt-8">
      <h1 className="text-center text-3xl">my apps</h1>
      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        <Link
          href="/apps/app-1"
          className="rounded-xl border border-white/20 p-6 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <h2 className="text-xl">App 1</h2>
          <p className="mt-2 text-sm text-white/60">Your first app. Coming soon.</p>
        </Link>
      </div>
    </main>
  );
}
