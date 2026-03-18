import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { AppShellComponent } from './layouts/app-shell/app-shell';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
    canActivate: [noAuthGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/verify-email/verify-email').then(m => m.VerifyEmailPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPasswordPage),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'mis-comunidades',
        loadComponent: () => import('./pages/mis-comunidades/mis-comunidades').then(m => m.MisComunidadesPage),
      },
      {
        path: 'datos-comunidad',
        loadComponent: () => import('./pages/datos-comunidad/datos-comunidad').then(m => m.DatosComunidadPage),
      },
      {
        path: 'recomendaciones',
        loadComponent: () => import('./pages/recomendaciones/recomendaciones').then(m => m.RecomendacionesPage),
      },
      {
        path: 'dashboard-gestoria',
        loadComponent: () => import('./pages/dashboard-gestoria/dashboard-gestoria').then(m => m.DashboardGestoriaPage),
      },
      {
        path: 'presentacion-cliente',
        loadComponent: () => import('./pages/presentacion-cliente/presentacion-cliente').then(m => m.PresentacionClientePage),
      },
    ],
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
