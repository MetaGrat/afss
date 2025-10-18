import { Transaction, SortKey } from '../types';
import { formatters, formatDate, formatId, shortenAddress } from '../utils/formatters';

export class TableComponent {
  private tbody: HTMLElement;
  private countBadge: HTMLElement;
  private data: Transaction[] = [];
  private sortKey: SortKey = 'time';
  private sortAsc: boolean = false;

  constructor() {
    this.tbody = document.getElementById('tbody') as HTMLElement;
    this.countBadge = document.getElementById('countBadge') as HTMLElement;
    this.setupSortHandlers();
  }

  private setupSortHandlers(): void {
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = (th as HTMLElement).dataset.sort as string;
        const sortMap: Record<string, SortKey> = {
          id: 'id',
          time: 'time',
          wallet: 'wallet',
          amount: 'amount',
          usd: 'usd',
          rate: 'rate'
        };
        const k = sortMap[key] || key as SortKey;
        
        if (this.sortKey === k) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortKey = k;
          this.sortAsc = true;
        }
        this.render();
      });
    });
  }

  private toRow(row: Transaction): string {
    const formattedDate = formatDate(row.time);
    const formattedId = formatId(row.id);
    const link = `https://allo.info/tx/${row.id}`;
    
    return `<tr class="hover:bg-white/5">
      <td class="px-4 py-3 font-medium"><a target="_blank" rel="noopener" href="${link}">${formattedId}</a></td>
      <td class="px-4 py-3 whitespace-nowrap">${formattedDate}</td>
      <td class="px-4 py-3">${shortenAddress(row.sender)}</td>
      <td class="px-4 py-3">${formatters.number.format(row.algo)}</td>
      <td class="px-4 py-3">${row.usd == null ? '—' : formatters.usd.format(row.usd)}</td>
      <td class="px-4 py-3">${row.price == null ? '—' : row.price.toFixed(4)}</td>
    </tr>`;
  }

  render(): void {
    const rows = [...this.data].sort((a, b) => {
      const getValue = (row: Transaction) => {
        switch (this.sortKey) {
          case 'time': return row.time;
          case 'amount': return row.algo;
          case 'usd': return row.usd ?? -1;
          case 'rate': return row.price ?? -1;
          case 'id': return row.id;
          case 'wallet': return row.sender;
          default: return 0;
        }
      };
      
      const av = getValue(a);
      const bv = getValue(b);
      
      if (typeof av === 'string' && typeof bv === 'string') {
        return this.sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      
      return this.sortAsc 
        ? (av > bv ? 1 : av < bv ? -1 : 0)
        : (av < bv ? 1 : av > bv ? -1 : 0);
    });
    
    this.tbody.innerHTML = rows.map(row => this.toRow(row)).join('');
    this.countBadge.textContent = rows.length + ' rows';
  }

  setData(data: Transaction[]): void {
    this.data = data;
    this.render();
  }

  showLoading(): void {
    this.tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-[color:var(--muted)]">Fetching transactions…</td></tr>`;
  }

  showError(error: string): void {
    this.tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-rose-300">${error}</td></tr>`;
  }
}
