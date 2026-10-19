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

City search and a seven-day Celsius forecast use Open-Meteo directly from the browser, with no API key. Melbourne is the default city. Current location is optional and requires browser permission and HTTPS (or localhost); city search works on the local Wi-Fi preview. Coordinates are sent to Open-Meteo only after choosing the location button.

Forecast requests time out after 12 seconds and provide retry and clearly labelled sample-preview options. Sample values are never presented as real weather. The free service is intended for non-commercial use; review Open-Meteo terms before commercial use.

Validation: lint, TypeScript, production build, mobile and desktop browser checks, navigation, search validation, timeout/retry and sample forecast rendering. Live API calls could not be verified in the development environment because the API hostname failed DNS resolution.
