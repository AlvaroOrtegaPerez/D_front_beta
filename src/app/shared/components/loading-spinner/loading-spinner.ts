import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrap">
      <div class="spinner"></div>
      @if (text) { <p class="spinner-text">{{ text }}</p> }
    </div>
  `,
  styles: [`
    .spinner-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; }
    .spinner {
      width: 40px; height: 40px;
      border: 3.5px solid #e2e8f0;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .spinner-text { margin-top: 16px; color: #64748b; font-size: 0.9rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingSpinnerComponent {
  @Input() text = '';
}
