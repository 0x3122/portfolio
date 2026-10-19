# Vercel hosting

Import `0x3122/portfolio` into Vercel using the Next.js preset, production branch `main`, Node 24, install command `pnpm install --frozen-lockfile`, and build command `pnpm build`. Vercel manages the output directory. Enable previews for pull requests.

Never upload `.env.local` or add the Riot development key to Vercel. On Vercel, Quantum OPGG always displays the labelled 19 October 2026 snapshot and both live Riot API routes return HTTP 403. Local live testing is retained. Use `RIOT_SNAPSHOT_MODE=1` during local build and runtime to verify the public behavior.

Weather remains live through the server API. Before enabling public live Riot data, obtain Riot production access and implement shared caching, rate limiting, and background analysis.

Ask for approval before the first public deployment and verify the deployed homepage, weather search, and snapshot at desktop and mobile sizes.
