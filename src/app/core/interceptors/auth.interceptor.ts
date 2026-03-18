import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (req.headers.has('X-Skip-Auth')) {
    const cleaned = req.clone({ headers: req.headers.delete('X-Skip-Auth') });
    return next(cleaned);
  }

  const token = tokenService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        tokenService.clearToken();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
