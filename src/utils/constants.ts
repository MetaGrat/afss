export const SENDERS = [
  '37VPAD3CK7CDHRE4U3J75IE4HLFN5ZWVKJ52YFNBX753NNDN6PUP2N7YKI',
  '44GWRTQGSAYUJJCQ3GFINYKZXMBDVKCF75VMCXKORN7ZJ6BKPNG2RMGH7E',
] as const;

export const START_DATE = '2025-01-01T00:00:00Z';
export const END_DATE = '2026-01-01T00:00:00Z';
export const MAX_ROWS = 100;

export const INDEXER_URL = 'https://mainnet-idx.algonode.cloud/v2/transactions';
export const CRYPTO_COMPARE_URL = 'https://min-api.cryptocompare.com/data/pricehistorical';

export const CONCURRENCY_LIMIT = 6;
export const PRICE_FETCH_CONCURRENCY = 3;
export const MAX_RETRIES = 3;
