import { Routes } from '@angular/router';
import { featureFlagGuard } from '../../core/guards/feature-flag.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'audit-logs',
    canActivate: [featureFlagGuard],
    data: { featureFlag: 'AUDIT_AUTH' },
    loadComponent: () =>
      import('./pages/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
  },
  {
    path: 'feature-flags',
    canActivate: [featureFlagGuard],
    data: { featureFlag: 'FEATURE_FLAG_MANAGEMENT' },
    loadComponent: () =>
      import('./pages/feature-flags/feature-flags.component').then(m => m.FeatureFlagsComponent),
  },
  {
    path: 'system-config',
    canActivate: [featureFlagGuard],
    data: { featureFlag: 'SYSTEM_CONFIG_MANAGEMENT' },
    loadComponent: () =>
      import('./pages/system-config/system-config.component').then(m => m.SystemConfigComponent),
  },
  {
    path: '',
    redirectTo: 'feature-flags',
    pathMatch: 'full',
  },
];
