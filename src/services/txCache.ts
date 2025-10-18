const KEY = 'af_tx_enriched_v1';

export type Enriched = { id: string; price?: number; usd?: number };
export type TxCache = Record<string, Enriched>;

export function loadTxCache(): TxCache {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function saveTxCache(cache: TxCache) {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
}


