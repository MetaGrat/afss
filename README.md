# AF Structured Selling 2025 - TypeScript Dashboard

A TypeScript dashboard for tracking Algorand Foundation Structured Selling transactions. This project provides real-time data visualization with sorting, filtering, and export capabilities.

## Features

- 📊 **Real-time Data**: Fetches live transaction data from Algorand blockchain
- 💰 **Price Integration**: Historical USD pricing via CryptoCompare API
- 📈 **Interactive Dashboard**: Sortable columns and summary statistics
- 📁 **CSV Export**: Download transaction data for analysis
- 📉 **Charts**: 12-month pie chart showing ALGO sold per month with per-month USD totals and average USD/ALGO
- 🖼️ **Chart Export (PNG)**: Export the current chart view as a PNG (filename: af_structured_selling_2025.png)


## Configuration

The dashboard tracks transactions from two specific Algorand Foundation wallets:

- `37VPAD3CK7CDHRE4U3J75IE4HLFN5ZWVKJ52YFNBX753NNDN6PUP2N7YKI`
- `44GWRTQGSAYUJJCQ3GFINYKZXMBDVKCF75VMCXKORN7ZJ6BKPNG2RMGH7E`

Date range: 2025-01-01 to 2025-12-31

## API Endpoints

- **Algorand Indexer**: `https://mainnet-idx.algonode.cloud/v2/transactions`
- **CryptoCompare**: `https://min-api.cryptocompare.com/data/pricehistorical`


## License

MIT License - see LICENSE file for details

## Disclaimer

This site utilizes publicly accessible data to estimate the results of Algorand Foundation Structured Selling. In the event of any discrepancies, the data provided by the Algorand Foundation should be considered the authoritative source.

Built by [@MetaGrat](https://x.com/MetaGrat)