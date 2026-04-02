import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const requiredPermission: string | undefined = route.data['permission'];
  const requiredRole: string | undefined = route.data['role'];

  if (requiredPermission && !authState.hasPermission(requiredPermission)) {
    return router.createUrlTree(['/dashboard']);
  }

  if (requiredRole && !authState.hasRole(requiredRole)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
