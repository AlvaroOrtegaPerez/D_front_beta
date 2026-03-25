import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) return null;
  const errors: Record<string, boolean> = {};
  if (val.length < 8) errors['minLength'] = true;
  if (!/[A-Z]/.test(val)) errors['uppercase'] = true;
  if (!/[a-z]/.test(val)) errors['lowercase'] = true;
  if (!/[0-9]/.test(val)) errors['digit'] = true;
  if (!/[^A-Za-z0-9]/.test(val)) errors['special'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]],
    rgpd: [false, [Validators.requiredTrue]],
    newsletter: [false],
  });

  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  showRgpdModal = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfirmPassword(): void { this.showConfirmPassword.update(v => !v); }

  get passwordsMatch(): boolean {
    return this.form.value.password === this.form.value.confirmPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.passwordsMatch) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const { nombre, email, password, newsletter } = this.form.getRawValue();

    this.authService.signup({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      newsletter,
    }).subscribe({
      next: () => {
        this.authService.requestEmailVerification({
          email: email.trim().toLowerCase(),
          nombre: nombre.trim(),
        }).subscribe();

        this.successMsg.set('Cuenta creada. Te enviamos un email para verificar tu cuenta.');
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al crear la cuenta. Inténtalo de nuevo.');
      }
    });
  }
}
