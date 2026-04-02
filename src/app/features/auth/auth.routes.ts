import { Routes } from '@angular/router';
import { publicOnlyGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'confirm',
    loadComponent: () =>
      import('./pages/confirm-token/confirm-token.component').then(m => m.ConfirmTokenComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
