import { Transaction, AlgorandApiResponse } from '../types';
import { SENDERS, START_DATE, END_DATE, MAX_ROWS } from '../utils/constants';

const INDEXER_URL = (import.meta.env.VITE_INDEXER_URL as string) || 'https://mainnet-idx.algonode.cloud/v2/transactions';

export class ApiService {
  async fetchAllTransactions(): Promise<Transaction[]> {
    const all: Transaction[] = [];
    
    for (const sender of SENDERS) {
      const part = await this.fetchForSender(sender);
      all.push(...part);
      if (all.length >= MAX_ROWS) break;
    }
    
    all.sort((a, b) => a.time - b.time);
    return all.slice(0, MAX_ROWS);
  }

  private async fetchForSender(sender: string): Promise<Transaction[]> {
    const out: Transaction[] = [];
    let nextToken: string | undefined = undefined;
    
    while (out.length < MAX_ROWS) {
      const url = new URL(INDEXER_URL);
      url.searchParams.set('tx-type', 'pay');
      url.searchParams.set('address', sender);
      url.searchParams.set('address-role', 'sender');
      url.searchParams.set('after-time', START_DATE);
      url.searchParams.set('before-time', END_DATE);
      url.searchParams.set('limit', '50');
      if (nextToken) url.searchParams.set('next', nextToken);

      const response = await fetch(url, { 
        headers: { 'accept': 'application/json' } 
      });
      
      if (!response.ok) {
        throw new Error(`Indexer error ${response.status}`);
      }
      
      const data: AlgorandApiResponse = await response.json();
      const transactions = (data.transactions || []).map(tx => ({
        id: tx.id,
        time: tx['round-time'] || 0,
        amtMicro: tx['payment-transaction']?.amount ?? 0,
        sender: tx.sender,
      }));
      
      for (const t of transactions) {
        const algo = t.amtMicro / 1_000_000;
        out.push({ 
          id: t.id, 
          time: t.time, 
          sender: t.sender, 
          algo 
        });
      }
      
      if (!data['next-token'] || transactions.length === 0) break;
      nextToken = data['next-token'];
    }
    
    return out;
  }

}
