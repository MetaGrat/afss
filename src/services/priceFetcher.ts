import { PriceCache } from './priceCache';

const CC_BASE = (import.meta.env.VITE_CRYPTOCOMPARE_URL as string) || 'https://min-api.cryptocompare.com';

async function getJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
}


export async function getHistoricalUsd(tsSec: number, cache: PriceCache): Promise<number | undefined> {
  // Check cache first
  const cached = cache.getCached(tsSec);
  if (cached !== undefined) return cached;

  const url = `${CC_BASE}/data/pricehistorical?fsym=ALGO&tsyms=USD&ts=${tsSec}`;
  let retry = 0;
  const maxRetries = 3;
  while (retry < maxRetries) {
    const data = await getJson(url);
    const p = data?.ALGO?.USD;
    if (typeof p === 'number') {
      // Update cache
      cache.set(tsSec, p);
      return p;
    }
    retry++;
    if (retry < maxRetries) {
      await new Promise(res => setTimeout(res, 1000 * retry));
    }
  }
  return undefined;
}


