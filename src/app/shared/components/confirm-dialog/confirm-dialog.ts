import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalComponent } from '../modal/modal';
import { EcoButtonComponent } from '../eco-button/eco-button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, EcoButtonComponent],
  template: `
    <app-modal [open]="open" [title]="title" maxWidth="440px" (closed)="cancelled.emit()">
      <p class="confirm-msg">{{ message }}</p>
      <div class="confirm-actions">
        <app-eco-button variant="ghost" (clicked)="cancelled.emit()">Cancelar</app-eco-button>
        <app-eco-button [variant]="destructive ? 'destructive' : 'primary'" (clicked)="confirmed.emit()">
          {{ confirmText }}
        </app-eco-button>
      </div>
    </app-modal>
  `,
  styles: [`
    .confirm-msg { color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
  `]
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmar';
  @Input() message = '';
  @Input() confirmText = 'Confirmar';
  @Input() destructive = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
