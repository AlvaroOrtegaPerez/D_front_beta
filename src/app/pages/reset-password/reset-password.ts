import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="modern-layout">
      <div class="glass-card">
        <div class="header">
          <div class="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7V6h7a7 7 0 0 1 7 7v7Z"/></svg>
          </div>
          <h1 class="title">Nueva contraseña</h1>
        </div>

        @if (success()) {
          <div class="success-banner">Contraseña actualizada. Ya puedes iniciar sesión.</div>
          <a routerLink="/login" class="btn-submit">Iniciar sesión</a>
        } @else {
          @if (errorMsg()) { <div class="error-banner">{{ errorMsg() }}</div> }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="input-group">
              <input [type]="showPassword() ? 'text' : 'password'" class="input-field" placeholder=" " id="rp-pass" formControlName="password">
              <label class="floating-label" for="rp-pass">Nueva contraseña</label>
              <button type="button" class="eye-btn" title="Mostrar contraseña" (click)="togglePassword()">
                @if (showPassword()) {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <div class="input-group">
              <input [type]="showConfirmPassword() ? 'text' : 'password'" class="input-field" placeholder=" " id="rp-pass2" formControlName="confirmPassword">
              <label class="floating-label" for="rp-pass2">Confirmar contraseña</label>
              <button type="button" class="eye-btn" title="Mostrar contraseña" (click)="toggleConfirmPassword()">
                @if (showConfirmPassword()) {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <button type="submit" class="btn-submit" [disabled]="loading() || form.invalid || form.value.password !== form.value.confirmPassword">
              @if (loading()) { <span class="btn-spinner"></span> Guardando... } @else { Guardar contraseña }
            </button>
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
export class ResetPasswordPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  loading = signal(false);
  success = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.errorMsg.set('Token no válido.'); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.resetPassword({ token, password: this.form.getRawValue().password }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al cambiar la contraseña.');
      }
    });
  }
}
