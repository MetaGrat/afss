export interface Transaction {
  id: string;
  time: number;
  sender: string;
  algo: number;
  price?: number;
  usd?: number;
}

export interface AlgorandTransaction {
  id: string;
  'round-time': number;
  'payment-transaction': {
    amount: number;
  };
  sender: string;
}

export interface AlgorandApiResponse {
  transactions?: AlgorandTransaction[];
  'next-token'?: string;
}

export interface CryptoCompareResponse {
  ALGO?: {
    USD: number;
  };
}

export interface SortConfig {
  key: string;
  ascending: boolean;
}

export interface SummaryData {
  totalAlgo: number;
  totalUsd: number;
  avgRate: number;
}

export type SortKey = 'id' | 'time' | 'wallet' | 'amount' | 'usd' | 'rate';
