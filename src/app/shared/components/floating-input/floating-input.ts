import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-floating-input',
  standalone: true,
  template: `
    <div class="fi-group" [class.fi-group--error]="error">
      <input
        [type]="type"
        [id]="inputId"
        class="fi-input"
        [placeholder]="placeholderText"
        [value]="value"
        [disabled]="isDisabled"
        [attr.min]="min"
        [attr.max]="max"
        [attr.maxlength]="maxlength"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        (blur)="onTouched()" />
      <label class="fi-label" [for]="inputId">{{ label }}</label>
      @if (error) { <span class="fi-error">{{ error }}</span> }
    </div>
  `,
  styles: [`
    .fi-group { position: relative; margin-bottom: 20px; }
    .fi-input {
      width: 100%; padding: 20px 16px 8px; background: rgba(241,245,249,0.6);
      border: 2px solid transparent; border-radius: 12px; font-size: 1rem;
      color: #1e293b; transition: all 0.3s ease; box-sizing: border-box;
      font-family: inherit;
    }
    .fi-input:focus {
      outline: none; background: white;
      border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1);
    }
    .fi-label {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      font-size: 1rem; color: #64748b; pointer-events: none;
      transition: all 0.2s ease;
    }
    .fi-input:focus ~ .fi-label,
    .fi-input:not(:placeholder-shown) ~ .fi-label {
      top: 12px; font-size: 0.75rem; font-weight: 600; color: #10b981;
    }
    .fi-input::placeholder { color: transparent; }
    .fi-input:focus::placeholder { color: #94a3b8; }
    .fi-group--error .fi-input { border-color: #ef4444; }
    .fi-group--error .fi-input:focus { box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }
    .fi-error { display: block; font-size: 0.75rem; color: #ef4444; margin-top: 4px; padding-left: 4px; }
    .fi-input:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FloatingInputComponent),
    multi: true,
  }]
})
export class FloatingInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() inputId = 'fi-' + Math.random().toString(36).slice(2, 8);
  @Input() error = '';
  @Input() min?: string;
  @Input() max?: string;
  @Input() maxlength?: string;
  @Input() placeholderText = ' ';

  value = '';
  isDisabled = false;
  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (val: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.type === 'number') {
      if (event.key === '-' || event.key === '+') {
        event.preventDefault();
      }
    }
  }
}
