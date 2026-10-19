# Portfolio

Minimal Next.js App Router application using TypeScript, Tailwind CSS, and pnpm.

## Development

Requires Node.js 24 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. The homepage links to Quantum Weather App at `/apps/quantum-weather`. The old `/apps/app-1` address redirects there.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm build
```

Run the production build locally with `pnpm start`.

Use feature branches and pull requests for major changes. Never commit secrets or API keys.

## Quantum Weather App

City search and a seven-day Celsius forecast use Open-Meteo through the app’s server routes, with no API key. Melbourne is the default city. Current location is optional and requires browser permission and HTTPS (or localhost); city search works on the local Wi-Fi preview. Coordinates are sent to Open-Meteo only after choosing the location button.

Forecast requests time out after 25 seconds and provide retry and clearly labelled sample-preview options. Sample values are never presented as real weather. The free service is intended for non-commercial use; review Open-Meteo terms before commercial use.

Validation: lint, TypeScript, production build, mobile and desktop browser checks, navigation, search validation, timeout/retry and sample forecast rendering. Live Melbourne forecasts and Sydney city-search responses were verified through the local server. Server requests use system DNS first, with a scoped Google HTTPS DNS fallback when resolution fails. Resolved addresses respect DNS TTLs (up to five minutes), and upstream TLS certificate validation remains enabled.

## Quantum OPGG (App 2)

`/apps/quantum-opgg` displays SHin4suRA#OC on OCE, including summoner level, Solo/Duo and Flex rank, and the most-played champion in up to 100 recent ranked matches (ties are shown). This is a recent-match metric, not lifetime champion mastery.

Set `RIOT_API_KEY` in an ignored `.env.local` file. Keep the key on the server and never use a `NEXT_PUBLIC_` variable for it. Development keys expire after 24 hours. Riot account lookups use AMERICAS; OCE platform calls use OC1 and match history uses SEA. Riot requests are paced at one every 1.5 seconds; HTTP 429 responses respect Retry-After. Profile data caches for five minutes and analysis for fifteen minutes, with duplicate in-flight requests shared in a single server process.

The first champion calculation takes about 3–5 minutes. This prototype runs on a single local server. Before multi-instance/public hosting, move the rate limiter and cache to shared storage and champion analysis to a background job; obtain the appropriate Riot production key. No API key is included in Git or browser responses.
