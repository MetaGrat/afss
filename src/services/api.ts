import { Transaction, AlgorandApiResponse } from '../types';
import { SENDERS, START_DATE, END_DATE, MAX_ROWS } from '../utils/constants';
import csvContent from '../data/afss_json.csv?raw';

const INDEXER_URL = (import.meta.env.VITE_INDEXER_URL as string) || 'https://mainnet-idx.algonode.cloud/v2/transactions';

export class ApiService {
  async fetchAllTransactions(): Promise<Transaction[]> {
    // 1. Load historic data from CSV
    const historic = this.parseCsv(csvContent);
    
    // 2. Find latest time in historic data
    let maxTime = 0;
    for (const tx of historic) {
      if (tx.time > maxTime) maxTime = tx.time;
    }

    // 3. Fetch new transactions (only if we haven't reached MAX_ROWS with historic)
    //    Note: We'll fetch everything newer than maxTime
    const newTxs: Transaction[] = [];
    
    // If we already have enough data, we might still want to check for *newer* data 
    // to ensure the list is up to date, but respect MAX_ROWS for the final output.
    // However, usually "historic" implies we want to keep it and just add on top.
    
    // Let's fetch new data for all senders
    for (const sender of SENDERS) {
      // Pass maxTime as the "after-time" filter (need to convert to ISO string)
      const part = await this.fetchForSender(sender, maxTime);
      newTxs.push(...part);
    }

    // 4. Merge and Deduplicate
    // Create a map by ID to prevent duplicates
    const allMap = new Map<string, Transaction>();
    
    for (const tx of historic) allMap.set(tx.id, tx);
    for (const tx of newTxs) allMap.set(tx.id, tx);

    const all = Array.from(allMap.values());
    
    // 5. Sort by time (ascending)
    all.sort((a, b) => a.time - b.time);
    
    // 6. Return top MAX_ROWS
    return all.slice(0, MAX_ROWS);
  }

  private parseCsv(content: string): Transaction[] {
    const lines = content.trim().split('\n');
    const transactions: Transaction[] = [];
    
    // Skip header (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Columns: ID, Date (UTC), Wallet, Sold Amount (ALGO), USD Value, Rate (USD/ALGO)
      const cols = line.split(',');
      if (cols.length < 6) continue;

      const id = cols[0].trim();
      const dateStr = cols[1].trim();
      const sender = cols[2].trim();
      const algo = parseFloat(cols[3].trim());
      const usd = parseFloat(cols[4].trim());
      const price = parseFloat(cols[5].trim());

      const time = Math.floor(new Date(dateStr).getTime() / 1000);

      transactions.push({
        id,
        time,
        sender,
        algo,
        price,
        usd
      });
    }
    return transactions;
  }

  private async fetchForSender(sender: string, minTimeSec: number): Promise<Transaction[]> {
    const out: Transaction[] = [];
    let nextToken: string | undefined = undefined;
    
    // Convert minTimeSec to ISO string for the API
    // If minTimeSec is 0, use START_DATE from constants
    const afterTime = minTimeSec > 0 
      ? new Date(minTimeSec * 1000).toISOString() 
      : START_DATE;

    while (out.length < MAX_ROWS) {
      const url = new URL(INDEXER_URL);
      url.searchParams.set('tx-type', 'pay');
      url.searchParams.set('address', sender);
      url.searchParams.set('address-role', 'sender');
      url.searchParams.set('after-time', afterTime);
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
