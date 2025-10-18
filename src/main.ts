import { Transaction } from './types';
import { DataProcessor } from './services/dataProcessor';
import { TableComponent } from './components/Table';
import { SummaryComponent } from './components/Summary';
import { ControlsComponent } from './components/Controls';
import { GraphsComponent } from './components/Graphs';

class App {
  private data: Transaction[] = [];
  private dataProcessor: DataProcessor;
  private tableComponent: TableComponent;
  private summaryComponent: SummaryComponent;
  private controlsComponent: ControlsComponent;
  private graphsComponent: GraphsComponent;

  constructor() {
    this.dataProcessor = new DataProcessor();
    this.tableComponent = new TableComponent();
    this.summaryComponent = new SummaryComponent();
    this.graphsComponent = new GraphsComponent();
    this.controlsComponent = new ControlsComponent(
      () => this.loadData(),
      (data) => this.exportToCsv(data)
    );
  }

  async loadData(): Promise<void> {
    this.tableComponent.showLoading();
    
    try {
  const { ApiService } = await import('./services/api');
      const api = new ApiService();
      const baseData = await api.fetchAllTransactions();
      const enrichedData = await this.dataProcessor.enrichWithPrices(baseData);
      
      this.data = enrichedData;
      this.tableComponent.setData(this.data);
      this.summaryComponent.updateSummary(this.data);
      this.controlsComponent.setCurrentData(this.data);
      this.graphsComponent.setData(this.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.tableComponent.showError(errorMessage);
      console.error('Error loading data:', error);
    }
  }

  private exportToCsv(data: Transaction[]): void {
    this.controlsComponent.exportToCsv(data);
  }

  async initialize(): Promise<void> {
    await this.loadData();

    
    const toggleBtn = document.getElementById('toggleGraphsBtn') as HTMLButtonElement | null;
    const graphsSection = document.getElementById('graphsSection') as HTMLElement | null;
    
    const tableSection = document.getElementById('tableSection') as HTMLElement
      || (document.querySelector('table')?.closest('section') as HTMLElement | null)
      || (document.querySelector('.table')?.closest('section') as HTMLElement | null);

    
    const sortHint = Array.from(document.querySelectorAll('div')).find(el =>
      el.textContent?.trim().startsWith('Click any column header')
    ) as HTMLElement | undefined;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const graphsVisible = graphsSection && getComputedStyle(graphsSection).display !== 'none';

        if (!graphsVisible) {
          if (graphsSection) {
            graphsSection.style.display = '';
            graphsSection.style.textAlign = 'center';
          }
          if (tableSection) tableSection.style.display = 'none';
          if (sortHint) sortHint.style.display = 'none';
          toggleBtn.textContent = 'Show table';
          this.graphsComponent.show();

          this.controlsComponent.setExportMode('png', () => {
            const canvas = document.getElementById('chartCanvas') as HTMLCanvasElement | null;
            if (!canvas) return;
            canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'af_structured_selling_2025.png';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }, 'image/png');
          });
        } else {
          if (graphsSection) graphsSection.style.display = 'none';
          if (tableSection) tableSection.style.display = '';
          if (sortHint) sortHint.style.display = '';
          toggleBtn.textContent = 'Show charts';
          this.graphsComponent.hide();

          this.controlsComponent.setExportMode('csv');
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();
});
