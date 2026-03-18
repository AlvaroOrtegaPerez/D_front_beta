import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: `
    <div class="stepper">
      @for (step of steps; track step; let i = $index) {
        <div class="stepper__step" [class.stepper__step--active]="i === current" [class.stepper__step--done]="i < current">
          <div class="stepper__circle">
            @if (i < current) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            } @else {
              {{ i + 1 }}
            }
          </div>
          <span class="stepper__label">{{ step }}</span>
        </div>
        @if (i < steps.length - 1) {
          <div class="stepper__line" [class.stepper__line--done]="i < current"></div>
        }
      }
    </div>
  `,
  styles: [`
    .stepper { display: flex; align-items: center; gap: 0; margin-bottom: 32px; }
    .stepper__step {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .stepper__circle {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700;
      background: #e2e8f0; color: #64748b;
      transition: all 0.3s ease;
    }
    .stepper__step--active .stepper__circle {
      background: linear-gradient(135deg, #10b981, #047857);
      color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    }
    .stepper__step--done .stepper__circle {
      background: #10b981; color: white;
    }
    .stepper__label {
      font-size: 0.85rem; font-weight: 600; color: #94a3b8;
      white-space: nowrap;
    }
    .stepper__step--active .stepper__label { color: #1e293b; }
    .stepper__step--done .stepper__label { color: #10b981; }
    .stepper__line {
      flex: 1; height: 3px; background: #e2e8f0;
      margin: 0 8px; border-radius: 2px;
      transition: background 0.3s ease; min-width: 20px;
    }
    .stepper__line--done { background: #10b981; }
    @media (max-width: 640px) {
      .stepper__label { display: none; }
      .stepper__line { min-width: 12px; }
    }
  `]
})
export class StepperComponent {
  @Input() steps: string[] = [];
  @Input() current = 0;
}
