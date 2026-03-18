import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { ToastService } from '../../core/services/toast.service';
import { ComunidadService } from '../../core/services/comunidad.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private comunidadService = inject(ComunidadService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email.trim().toLowerCase(), password }).subscribe({
      next: (res) => {
        const correoValidado = res.correo_validado ?? res.user?.correo_validado;
        if (correoValidado === false) {
          this.errorMsg.set('Tu correo no ha sido verificado. Revisa tu bandeja de entrada.');
          this.loading.set(false);
          return;
        }

        this.tokenService.setToken(res.authToken);
        this.comunidadService.getComunidades().subscribe({
          next: (comunidades) => {
            const list = Array.isArray(comunidades) ? comunidades : [];
            if (list.length > 0) {
              this.router.navigateByUrl('/mis-comunidades');
            } else {
              this.router.navigateByUrl('/datos-comunidad');
            }
          },
          error: () => {
            this.router.navigateByUrl('/mis-comunidades');
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al iniciar sesión. Inténtalo de nuevo.');
      }
    });
  }
}
