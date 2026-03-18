import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-layout">
      <div class="glass-card">
        <div class="header">
          <div class="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7V6h7a7 7 0 0 1 7 7v7Z"/></svg>
          </div>
          @if (loading()) {
            <h1 class="title">Verificando email...</h1>
            <div class="spinner-inline"></div>
          } @else if (success()) {
            <h1 class="title">Email verificado</h1>
            <p class="msg success-text">Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.</p>
            <a routerLink="/login" class="btn-submit">Iniciar sesión</a>
          } @else {
            <h1 class="title">Error de verificación</h1>
            <p class="msg error-text">{{ errorMsg() }}</p>
            <a routerLink="/login" class="btn-submit">Ir al login</a>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: '../login/login.css',
  styles: [`
    .msg { color: #64748b; margin: 16px 0 24px; line-height: 1.5; }
    .success-text { color: #047857; }
    .error-text { color: #dc2626; }
    .spinner-inline {
      width: 36px; height: 36px; margin: 20px auto;
      border: 3px solid #e2e8f0; border-top-color: #10b981;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VerifyEmailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loading = signal(true);
  success = signal(false);
  errorMsg = signal('El enlace de verificación no es válido o ha expirado.');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading.set(false);
      return;
    }

    this.authService.verifyEmail({ verify_token: token }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: () => { this.loading.set(false); }
    });
  }
}
