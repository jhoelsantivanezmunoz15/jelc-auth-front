import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'feature-flags',
    loadComponent: () =>
      import('./pages/feature-flags/feature-flags.component').then(m => m.FeatureFlagsComponent),
  },
  {
    path: 'system-config',
    loadComponent: () =>
      import('./pages/system-config/system-config.component').then(m => m.SystemConfigComponent),
  },
  {
    path: '',
    redirectTo: 'feature-flags',
    pathMatch: 'full',
  },
];
