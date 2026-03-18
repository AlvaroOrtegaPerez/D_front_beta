import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EcoButtonComponent } from '../eco-button/eco-button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [EcoButtonComponent],
  template: `
    <div class="empty">
      <div class="empty__icon" [innerHTML]="icon"></div>
      <h3 class="empty__title">{{ title }}</h3>
      <p class="empty__desc">{{ description }}</p>
      @if (actionText) {
        <app-eco-button variant="primary" (clicked)="action.emit()">{{ actionText }}</app-eco-button>
      }
    </div>
  `,
  styles: [`
    .empty { text-align: center; padding: 64px 24px; }
    .empty__icon {
      width: 72px; height: 72px; margin: 0 auto 20px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(4,120,87,0.08));
      display: flex; align-items: center; justify-content: center;
      color: #10b981;
    }
    .empty__title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .empty__desc { color: #64748b; margin: 0 0 24px; max-width: 360px; margin-inline: auto; line-height: 1.6; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
  @Input() actionText = '';
  @Output() action = new EventEmitter<void>();
}
