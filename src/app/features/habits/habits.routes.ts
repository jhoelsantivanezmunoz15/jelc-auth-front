import { Routes } from '@angular/router';

export const HABITS_ROUTES: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/habit-create/habit-create.component').then(m => m.HabitCreateComponent),
  },
  { path: '', redirectTo: 'create', pathMatch: 'full' },
];
