import seedPrices from '../data/algo_prices_2025.json';

const LS_KEY = 'algo_usd_price_cache_v2';

type PriceCacheShape = Record<string, number>;

function loadFromLocalStorage(): PriceCacheShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToLocalStorage(cache: PriceCacheShape) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch {}
}

function toDayKey(tsSec: number): string {
  const d = new Date(tsSec * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toHourKey(tsSec: number): string {
  const d = new Date(tsSec * 1000);
  d.setUTCMinutes(0, 0, 0);
  return `HOUR:${Math.floor(d.getTime() / 1000)}`;
}

export class PriceCache {
  private mem: PriceCacheShape;

  constructor() {
    this.mem = { ...loadFromLocalStorage() };
    for (const [day, price] of Object.entries(seedPrices || {})) {
      const key = `DAY:${day}`;
      if (this.mem[key] == null) this.mem[key] = price as number;
    }
    saveToLocalStorage(this.mem);
  }

  getCached(tsSec: number): number | undefined {
    const hourKey = toHourKey(tsSec);
    return this.mem[hourKey];
  }

  getCachedDay(tsSec: number): number | undefined {
    const dayKey = `DAY:${toDayKey(tsSec)}`;
    return this.mem[dayKey];
  }

  set(tsSec: number, price: number) {
    const hourKey = toHourKey(tsSec);
    this.mem[hourKey] = price;
    saveToLocalStorage(this.mem);
  }

  setDay(dayISO: string, price: number) {
    const dayKey = `DAY:${dayISO}`;
    this.mem[dayKey] = price;
    saveToLocalStorage(this.mem);
  }

  clear() {
    this.mem = {};
    saveToLocalStorage(this.mem);
  }
}


