import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="modern-layout">
      <div class="glass-card">
        <div class="header">
          <div class="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7V6h7a7 7 0 0 1 7 7v7Z"/></svg>
          </div>
          <h1 class="title">Recuperar contraseña</h1>
        </div>

        @if (sent()) {
          <div class="success-banner">Te hemos enviado un email con las instrucciones para restablecer tu contraseña.</div>
          <div class="switch-page"><a routerLink="/login">Volver al login</a></div>
        } @else {
          @if (errorMsg()) { <div class="error-banner">{{ errorMsg() }}</div> }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="input-group">
              <input type="email" class="input-field" placeholder=" " id="fp-email" formControlName="email">
              <label class="floating-label" for="fp-email">Correo electrónico</label>
            </div>
            <button type="submit" class="btn-submit" [disabled]="loading() || form.invalid">
              @if (loading()) { <span class="btn-spinner"></span> Enviando... } @else { Enviar enlace }
            </button>
            <div class="switch-page" style="margin-top: 20px"><a routerLink="/login">Volver al login</a></div>
          </form>
        }
      </div>
    </div>
  `,
  styleUrl: '../login/login.css',
  styles: [`.success-banner {
    background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
    border-radius: 12px; padding: 16px; margin-bottom: 20px;
    color: #047857; font-size: 0.95rem; line-height: 1.5; text-align: center;
  }`]
})
export class ForgotPasswordPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = signal(false);
  sent = signal(false);
  errorMsg = signal('');

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.forgotPassword({ email: this.form.getRawValue().email }).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al enviar el email.');
      }
    });
  }
}
