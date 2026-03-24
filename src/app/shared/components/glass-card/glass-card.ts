import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  template: `<div class="glass-card" [class.glass-card--hover]="hover"><ng-content /></div>`,
  styles: [`
    .glass-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.8);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
      transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .glass-card--hover {
      border: 1px solid rgba(16,185,129,0.15);
    }
    .glass-card--hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -10px rgba(16,185,129,0.15);
      border-color: rgba(16,185,129,0.4);
    }
    @media (max-width: 768px) {
      .glass-card { padding: 20px; border-radius: 16px; }
    }
    @media (max-width: 480px) {
      .glass-card { padding: 16px; border-radius: 14px; }
    }
  `]
})
export class GlassCardComponent {
  @Input() hover = false;
}
