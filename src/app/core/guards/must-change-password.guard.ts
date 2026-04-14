import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const mustChangePasswordGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return true;
  }

  if (authState.mustChangePassword() && state.url !== '/auth/force-change-password') {
    return router.createUrlTree(['/auth/force-change-password']);
  }

  return true;
};
