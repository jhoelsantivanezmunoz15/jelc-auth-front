import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/role-list/role-list.component').then(m => m.RoleListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/role-form/role-form.component').then(m => m.RoleFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/role-form/role-form.component').then(m => m.RoleFormComponent),
  },
];
