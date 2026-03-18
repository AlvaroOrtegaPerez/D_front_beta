import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal-content" [style.max-width]="maxWidth">
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="modal-close" (click)="closed.emit()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body"><ng-content /></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(15,23,42,0.5); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; animation: fadeIn 0.2s ease;
    }
    .modal-content {
      background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 20px; width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2);
      animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
      max-height: 90vh; overflow-y: auto;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px 28px 0;
    }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
    .modal-close {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #64748b; cursor: pointer; background: none; border: none;
      transition: background 0.2s, color 0.2s;
    }
    .modal-close:hover { background: rgba(0,0,0,0.05); color: #1e293b; }
    .modal-body { padding: 20px 28px 28px; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-width: 768px) {
      .modal-overlay { padding: 12px; align-items: flex-end; }
      .modal-content { border-radius: 16px 16px 0 0; max-height: 85vh; }
      .modal-header { padding: 16px 16px 0; }
      .modal-title { font-size: 1.05rem; }
      .modal-body { padding: 14px 16px 20px; }
    }
    @media (max-width: 480px) {
      .modal-overlay { padding: 0; }
      .modal-content { border-radius: 14px 14px 0 0; max-height: 90vh; }
      .modal-header { padding: 14px 14px 0; }
      .modal-body { padding: 12px 14px 16px; }
    }
  `]
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() maxWidth = '560px';
  @Output() closed = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closed.emit();
    }
  }
}
