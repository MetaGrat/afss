import { Transaction } from '../types';
import { PRICE_FETCH_CONCURRENCY } from '../utils/constants';
import { PriceCache } from './priceCache';
import { getHistoricalUsd } from './priceFetcher';

export class DataProcessor {
  private priceCache = new PriceCache();

  constructor() {}

  async processWithConcurrency<T, R>(
    items: T[], 
    worker: (item: T) => Promise<R>, 
    limit: number = 6
  ): Promise<R[]> {
    const results: R[] = [];
    let i = 0;
    const pool = new Set<Promise<unknown>>();
    
    return new Promise((resolve, reject) => {
      const pump = () => {
        if (i >= items.length && pool.size === 0) {
          return resolve(results);
        }
        
        while (i < items.length && pool.size < limit) {
          const idx = i++;
          const item = items[idx];
          const promise: Promise<unknown> = worker(item)
            .then(v => { results[idx] = v; })
            .catch(reject)
            .finally(() => {
              pool.delete(promise);
              pump();
            });
          pool.add(promise);
        }
      };
      pump();
    });
  }

  async enrichWithPrices(rows: Transaction[]): Promise<Transaction[]> {

    return this.processWithConcurrency(
      rows,
      async (row) => {

        const price = await getHistoricalUsd(row.time, this.priceCache);
        const usd = price != null ? row.algo * price : undefined;
        const enriched = { ...row, price: price ?? undefined, usd };
        return enriched;
      },
      PRICE_FETCH_CONCURRENCY
    );
  }
}
