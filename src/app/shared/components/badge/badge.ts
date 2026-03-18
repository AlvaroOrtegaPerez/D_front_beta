import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge badge--' + variant">{{ text }}</span>`,
  styles: [`
    .badge {
      display: inline-flex; align-items: center;
      padding: 4px 12px; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 600; white-space: nowrap;
    }
    .badge--success { background: rgba(16,185,129,0.1); color: #047857; }
    .badge--warning { background: rgba(245,158,11,0.1); color: #b45309; }
    .badge--error { background: rgba(239,68,68,0.1); color: #dc2626; }
    .badge--info { background: rgba(59,130,246,0.1); color: #2563eb; }
    .badge--neutral { background: rgba(100,116,139,0.1); color: #475569; }
  `]
})
export class BadgeComponent {
  @Input() text = '';
  @Input() variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral';
}
