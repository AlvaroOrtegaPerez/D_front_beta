import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <div class="metric-card">
      <div class="metric-card__icon" [innerHTML]="icon"></div>
      <div class="metric-card__value">{{ value }}</div>
      <div class="metric-card__label">{{ label }}</div>
    </div>
  `,
  styles: [`
    .metric-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease;
    }
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
    }
    .metric-card__icon {
      width: 48px; height: 48px; margin: 0 auto 12px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.1));
      display: flex; align-items: center; justify-content: center;
      color: #10b981;
    }
    .metric-card__value {
      font-size: 1.75rem; font-weight: 800;
      color: #1e293b; margin-bottom: 4px;
      word-break: break-word;
    }
    .metric-card__label {
      font-size: 0.85rem; color: #64748b; font-weight: 500;
    }
    @media (max-width: 768px) {
      .metric-card { padding: 16px; border-radius: 14px; }
      .metric-card__icon { width: 40px; height: 40px; margin-bottom: 8px; }
      .metric-card__value { font-size: 1.3rem; }
      .metric-card__label { font-size: 0.78rem; }
    }
    @media (max-width: 480px) {
      .metric-card { padding: 14px 12px; }
      .metric-card__value { font-size: 1.1rem; }
    }
  `]
})
export class MetricCardComponent {
  @Input() icon = '';
  @Input() value = '';
  @Input() label = '';
}
