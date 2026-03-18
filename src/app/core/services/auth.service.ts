import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  LoginPayload, LoginResponse, SignupPayload,
  ForgotPasswordPayload, ResetPasswordPayload,
  VerifyEmailPayload, RequestEmailVerificationPayload,
} from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.api.postNoAuth<LoginResponse>('auth', '/auth/login', credentials);
  }

  signup(payload: SignupPayload): Observable<unknown> {
    return this.api.postNoAuth('auth', '/auth/signup', payload);
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<unknown> {
    return this.api.postNoAuth('auth', '/auth/forgot-password', {
      email: payload.email.trim().toLowerCase(),
    });
  }

  resetPassword(payload: ResetPasswordPayload): Observable<unknown> {
    return this.api.postNoAuth('auth', '/auth/reset-password', {
      token: payload.token,
      password: payload.password.trim(),
    });
  }

  verifyEmail(payload: VerifyEmailPayload): Observable<unknown> {
    return this.api.postNoAuth('auth', '/auth/verify-email', payload);
  }

  requestEmailVerification(payload: RequestEmailVerificationPayload): Observable<unknown> {
    return this.api.postNoAuth('auth', '/auth/request-email-verification', payload);
  }
}
