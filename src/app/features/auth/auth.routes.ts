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
  {
    path: 'force-change-password',
    loadComponent: () =>
      import('./pages/force-change-password/force-change-password.component').then(m => m.ForceChangePasswordComponent),
  },
  {
    path: 'oauth2-callback',
    loadComponent: () =>
      import('./pages/oauth2-callback/oauth2-callback.component').then(m => m.OAuth2CallbackComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
