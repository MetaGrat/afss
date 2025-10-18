import { Transaction, SummaryData } from '../types';

export class SummaryComponent {
  private totalAlgoElement: HTMLElement;
  private totalUsdElement: HTMLElement;
  private avgRateElement: HTMLElement;

  constructor() {
    this.totalAlgoElement = document.getElementById('totalAlgo') as HTMLElement;
    this.totalUsdElement = document.getElementById('totalUsd') as HTMLElement;
    this.avgRateElement = document.getElementById('avgRate') as HTMLElement;
  }

  calculateSummary(data: Transaction[]): SummaryData {
    const totalAlgo = data.reduce((sum, row) => sum + row.algo, 0);
    const totalUsd = data.reduce((sum, row) => sum + (row.usd || 0), 0);
    const avgRate = totalUsd > 0 ? totalUsd / totalAlgo : 0;

    return { totalAlgo, totalUsd, avgRate };
  }

  updateSummary(data: Transaction[]): void {
    const summary = this.calculateSummary(data);
    
    this.totalAlgoElement.textContent = (summary.totalAlgo / 1_000_000).toFixed(1) + ' Million';
    this.totalUsdElement.textContent = (summary.totalUsd / 1_000_000).toFixed(1) + ' Million $';
    this.avgRateElement.textContent = summary.avgRate.toFixed(3);
  }
}
