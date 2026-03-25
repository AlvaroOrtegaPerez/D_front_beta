import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-floating-select',
  standalone: true,
  template: `
    <div class="fs-group" [class.fs-group--error]="error">
      <select
        [id]="inputId"
        class="fs-select"
        [class.fs-select--filled]="value"
        [value]="value"
        [disabled]="isDisabled"
        (change)="onSelect($event)"
        (blur)="onTouched()">
        <option value="" disabled selected hidden></option>
        @for (opt of options; track opt) {
          <option [value]="opt.value ?? opt">{{ opt.label ?? opt }}</option>
        }
      </select>
      <label class="fs-label" [for]="inputId" [class.fs-label--up]="!!value">{{ label }}</label>
      @if (error) { <span class="fs-error">{{ error }}</span> }
    </div>
  `,
  styles: [`
    .fs-group { position: relative; margin-bottom: 20px; }
    .fs-select {
      width: 100%; padding: 20px 16px 8px; background: rgba(241,245,249,0.6);
      border: 2px solid transparent; border-radius: 12px; font-size: 1rem;
      color: #1e293b; transition: all 0.3s ease; box-sizing: border-box;
      appearance: none; cursor: pointer; font-family: inherit;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 16px center;
    }
    .fs-select:focus {
      outline: none; background-color: white;
      border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1);
    }
    .fs-label {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      font-size: 1rem; color: #64748b; pointer-events: none;
      transition: all 0.2s ease;
    }
    .fs-label--up, .fs-select:focus ~ .fs-label {
      top: 12px; font-size: 0.75rem; font-weight: 600; color: #10b981;
    }
    .fs-group--error .fs-select { border-color: #ef4444; }
    .fs-error { display: block; font-size: 0.75rem; color: #ef4444; margin-top: 4px; padding-left: 4px; }
    .fs-select:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FloatingSelectComponent),
    multi: true,
  }]
})
export class FloatingSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() inputId = 'fs-' + Math.random().toString(36).slice(2, 8);
  @Input() options: readonly any[] = [];
  @Input() error = '';

  value = '';
  isDisabled = false;
  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (val: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
}
