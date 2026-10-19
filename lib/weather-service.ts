import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { get } from "node:https";

const addresses = new Map<string, { address: string; expires: number }>();

async function resolveHost(hostname: string): Promise<string> {
  const cached = addresses.get(hostname);
  if (cached && cached.expires > Date.now()) return cached.address;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      lookup(hostname, { family: 4 }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("DNS timeout")), 1200); }),
    ]);
    return result.address;
  } catch {
    // HTTPS DNS fallback is scoped to the two fixed weather-service hosts.
    const data = await requestJson(new URL(`https://dns.google/resolve?${new URLSearchParams({ name: hostname, type: "A" })}`)) as { Answer?: { type: number; data: string; TTL: number }[] };
    const answer = data.Answer?.find(item => item.type === 1 && isIP(item.data) === 4);
    if (!answer) throw new Error("Weather service address unavailable");
    addresses.set(hostname, { address: answer.data, expires: Date.now() + Math.min(answer.TTL, 300) * 1000 });
    return answer.data;
  } finally { clearTimeout(timer); }
}

export async function weatherService(url: URL): Promise<unknown> {
  if (!["api.open-meteo.com", "geocoding-api.open-meteo.com"].includes(url.hostname)) throw new Error("Unsupported weather host");
  const address = await resolveHost(url.hostname);
  return requestJson(url, address);
}

function requestJson(url: URL, address?: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = get(url, {
      family: 4,
      // Keep the original hostname for TLS certificate and SNI validation.
      ...(address ? { lookup: (_hostname: string, _options: unknown, callback: (error: Error | null, address: string, family: number) => void) => callback(null, address, 4) } : {}),
    }, response => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`Weather service HTTP ${response.statusCode}`)); return; }
      let body = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { body += chunk; if (body.length > 1000000) request.destroy(new Error("Weather response too large")); });
      response.on("end", () => { try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid weather response")); } });
      response.on("error", reject);
    });
    const timeout = setTimeout(() => request.destroy(new Error(`Request to ${url.hostname} timed out`)), 10000);
    request.on("close", () => clearTimeout(timeout));
    request.on("error", reject);
  });
}
