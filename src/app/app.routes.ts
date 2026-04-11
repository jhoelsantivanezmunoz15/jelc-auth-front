import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { menuGuard } from './core/guards/menu.guard';

export const routes: Routes = [
  // ─── Rutas públicas ──────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // ─── Rutas privadas (requieren JWT válido) ───────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        m => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      // Dashboard: siempre accesible para usuarios autenticados (punto de entrada)
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          ),
      },

      // Rutas dinámicas: el menuGuard consulta el árbol de menús del backend.
      // Si la ruta no aparece en el menú del usuario → redirige al dashboard.
      // Añadir un nuevo módulo aquí + registrarlo en el backend es suficiente
      // para que el acceso se conceda/revoque automáticamente.
      {
        path: 'roles',
        canActivate: [menuGuard],
        loadChildren: () =>
          import('./features/roles/roles.routes').then(m => m.ROLES_ROUTES),
      },
      {
        path: 'users',
        canActivate: [menuGuard],
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.USERS_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [menuGuard],
        loadChildren: () =>
          import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
