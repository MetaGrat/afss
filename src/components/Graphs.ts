import { Transaction } from '../types';
import { formatters } from '../utils/formatters';

export class GraphsComponent {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private data: Transaction[] = [];
  private colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
  ];

  constructor() {
    this.container = document.getElementById('graphsSection') as HTMLElement;
    this.canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;

    if (!this.canvas) throw new Error('chartCanvas not found');
    if (!this.container) throw new Error('graphsSection not found');

  this.container.style.display = 'none';

  this.container.style.textAlign = 'center';
  this.canvas.style.display = 'block';
  this.canvas.style.margin = '0 auto';

  this.render();
  }

  setData(rows: Transaction[]) {
  this.data = rows;
  if (this.isVisible()) this.render();
  }

  show() {
    this.container.style.display = '';
    this.container.style.textAlign = 'center';
    this.canvas.style.margin = '0 auto';
    this.render();
  }

  hide() {
    this.container.style.display = 'none';
  }

  toggle() {
    if (this.isVisible()) this.hide(); else this.show();
  }

  private isVisible() {
    return getComputedStyle(this.container).display !== 'none';
  }

  private monthLabels() {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  }

  private computeMonthlyTotals() {
    const algoTotals = new Array(12).fill(0);
    const usdTotals = new Array(12).fill(0);
    for (const row of this.data) {
      const d = new Date((row.time ?? 0) * 1000);
  const m = d.getUTCMonth();
      
      algoTotals[m] += row.algo ?? 0;
      usdTotals[m] += row.usd ?? 0;
    }
    return { algoTotals, usdTotals };
  }

  private render() {
    const { algoTotals, usdTotals } = this.computeMonthlyTotals();
    this.drawPie(algoTotals, usdTotals);
  }

  private clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);
  }

  private drawPie(algoValues: number[], usdValues: number[]) {
    const values = algoValues;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(800, rect.width);
    const height = Math.max(480, rect.height);
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    this.clearCanvas(ctx, width, height);

    const total = values.reduce((s, v) => s + v, 0);

    const padding = 28;
    const legendWidth = Math.min(420, Math.floor(width * 0.44));
    const availableForPie = Math.max(300, width - legendWidth - padding * 3);
    const radius = Math.max(100, Math.min(260, Math.floor(Math.min(availableForPie / 2, height / 2) - 10)));

  const cx = Math.floor(padding + radius);
    const cy = Math.floor(height / 2);
    const legendX = cx + radius + 40;

    let start = -Math.PI / 2;
    const labels = this.monthLabels();
    for (let i = 0; i < 12; i++) {
      const v = values[i];
      const angle = total > 0 ? (v / total) * Math.PI * 2 : 0;
      const end = start + angle;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, start, end);
  ctx.closePath();
  ctx.fillStyle = this.colors[i % this.colors.length];
  ctx.fill();

  if (angle > 0.04) {
        const mid = (start + end) / 2;
        const labelR = radius * 0.58;
        const lx = cx + Math.cos(mid) * labelR;
        const ly = cy + Math.sin(mid) * labelR;

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], lx, ly);
      }

      start = end;
    }


    const lineH = 28;
    const totalLegendHeight = lineH * 12;
    const startY = cy - Math.floor(totalLegendHeight / 2) + Math.floor(lineH / 2);

    ctx.textAlign = 'left';
    ctx.font = '14px Inter, system-ui, sans-serif';
    for (let i = 0; i < 12; i++) {
      const y = startY + i * lineH;
      ctx.fillStyle = this.colors[i % this.colors.length];
      ctx.fillRect(legendX, y - 10, 18, 18);

      ctx.fillStyle = '#e6eef7';
      const algoAmount = algoValues[i];
      const usdAmount = usdValues[i];

      const algoMillions = algoAmount / 1_000_000;
      const algoStr = algoMillions >= 1 ? `${algoMillions.toFixed(0)}M ALGO` : `${(algoAmount / 1_000).toFixed(2)}K ALGO`;

      const usdStr = usdAmount >= 1_000_000
        ? `${(usdAmount / 1_000_000).toFixed(1)}M USD`
        : formatters.usd.format(Math.round(usdAmount));

      let avgStr = '';
      if (algoAmount > 0) {
        const avg = usdAmount / algoAmount;
        avgStr = ` ($${avg.toFixed(2)} per ALGO)`;
      }

      const text = `${labels[i]}: ${algoStr} sold for ${usdStr}${avgStr}`;
      ctx.fillText(text, legendX + 24, y + 2);
    }

    ctx.restore();
  }
}