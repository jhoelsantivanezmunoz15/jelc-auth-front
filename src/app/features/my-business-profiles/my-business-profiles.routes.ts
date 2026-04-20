import { Routes } from '@angular/router';

export const MY_BUSINESS_PROFILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-business-profiles/my-business-profiles.component').then(
        m => m.MyBusinessProfilesComponent
      ),
  },
];
