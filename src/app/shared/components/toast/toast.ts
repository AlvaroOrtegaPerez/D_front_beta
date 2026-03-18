import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div class="toast" [class]="'toast--' + toast.type" (click)="toastService.dismiss(toast.id)">
        <span class="toast__icon">
          @switch (toast.type) {
            @case ('success') { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> }
            @case ('error') { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> }
            @case ('warning') { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
            @default { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> }
          }
        </span>
        <span class="toast__msg">{{ toast.message }}</span>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 12px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.5);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.16,1,0.3,1);
      max-width: 400px;
      font-size: 0.9rem;
    }
    .toast--success { border-left: 4px solid #10b981; }
    .toast--success .toast__icon { color: #10b981; }
    .toast--error { border-left: 4px solid #ef4444; }
    .toast--error .toast__icon { color: #ef4444; }
    .toast--warning { border-left: 4px solid #f59e0b; }
    .toast--warning .toast__icon { color: #f59e0b; }
    .toast--info { border-left: 4px solid #3b82f6; }
    .toast--info .toast__icon { color: #3b82f6; }
    .toast__icon { display: flex; flex-shrink: 0; }
    .toast__msg { color: #1e293b; line-height: 1.4; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
