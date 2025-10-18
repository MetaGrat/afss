import { Transaction } from '../types';

export class ControlsComponent {
  private reloadBtn: HTMLButtonElement;
  private exportCsvBtn: HTMLButtonElement;
  private exportBtn: HTMLButtonElement | null = null;
  private exportMode: 'csv' | 'png' = 'csv';
  private pngHandler: (() => void) | null = null;
  private currentData: Transaction[] = [];

  constructor(
    private onReload: () => void,
    private onExportCsv: (data: Transaction[]) => void
  ) {
    this.reloadBtn = document.getElementById('reloadBtn') as HTMLButtonElement;
    this.exportCsvBtn = document.getElementById('exportCsv') as HTMLButtonElement;
    this.setupEventListeners();

  this.exportBtn = document.getElementById('exportCsv') as HTMLButtonElement | null;
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.exportMode === 'csv') {
          this.exportToCsv(this.currentData);
        } else if (this.exportMode === 'png' && this.pngHandler) {
          this.pngHandler();
        }
      });
    }
  }

  private setupEventListeners(): void {
    this.reloadBtn.addEventListener('click', this.onReload);
    this.exportCsvBtn.addEventListener('click', () => {
      this.onExportCsv(this.currentData);
    });
  }

  public setCurrentData(rows: Transaction[]) {
    this.currentData = rows;
  }

  public setExportMode(mode: 'csv' | 'png', pngHandler?: () => void) {
    this.exportMode = mode;
    this.pngHandler = pngHandler ?? null;
    if (!this.exportBtn) {
      this.exportBtn = document.getElementById('exportCsv') as HTMLButtonElement | null;
    }
    if (!this.exportBtn) return;

    if (mode === 'csv') {
      this.exportBtn.textContent = 'Download CSV';
    } else {
      this.exportBtn.textContent = 'Download PNG';
    }
  }

  exportToCsv(data: Transaction[]): void {
    const header = 'ID,Date (UTC),Wallet,Sold Amount (ALGO),USD Value,Rate (USD/ALGO)';
    const body = data.map(row => [
      row.id,
      new Date(row.time * 1000).toISOString(),
      row.sender,
      row.algo,
      row.usd ?? '',
      row.price ?? ''
    ].join(','));
    
    const csvContent = header + '\n' + body.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'af_structured_selling_2025.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
