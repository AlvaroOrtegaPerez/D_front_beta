import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-eco-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [class]="'eco-btn eco-btn--' + variant + (block ? ' eco-btn--block' : '') + (loading ? ' eco-btn--loading' : '')"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)">
      @if (loading) {
        <span class="eco-btn__spinner"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [`
    .eco-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 700;
      cursor: pointer; border: none; transition: all 0.3s ease;
      position: relative; overflow: hidden; font-family: inherit;
    }
    .eco-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .eco-btn--block { width: 100%; }
    .eco-btn--primary {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white; box-shadow: 0 4px 15px rgba(16,185,129,0.3);
    }
    .eco-btn--primary:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16,185,129,0.4);
    }
    .eco-btn--outline {
      background: transparent; color: #047857;
      border: 2px solid #10b981;
    }
    .eco-btn--outline:hover:not(:disabled) {
      background: rgba(16,185,129,0.08); transform: translateY(-1px);
    }
    .eco-btn--ghost {
      background: transparent; color: #64748b; padding: 10px 16px;
    }
    .eco-btn--ghost:hover:not(:disabled) { background: rgba(0,0,0,0.04); color: #1e293b; }
    .eco-btn--destructive {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white; box-shadow: 0 4px 15px rgba(239,68,68,0.3);
    }
    .eco-btn--destructive:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 8px 25px rgba(239,68,68,0.4);
    }
    .eco-btn--sm { padding: 8px 16px; font-size: 0.85rem; border-radius: 8px; }
    .eco-btn--loading { pointer-events: none; }
    .eco-btn__spinner {
      width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      .eco-btn { padding: 12px 22px; font-size: 0.9rem; border-radius: 10px; }
      .eco-btn--sm { padding: 7px 14px; font-size: 0.82rem; }
    }
    @media (max-width: 480px) {
      .eco-btn { padding: 10px 18px; font-size: 0.85rem; }
    }
  `]
})
export class EcoButtonComponent {
  @Input() variant: 'primary' | 'outline' | 'ghost' | 'destructive' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  @Output() clicked = new EventEmitter<Event>();
}
