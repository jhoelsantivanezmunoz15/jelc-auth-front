import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlagStateService } from '../services/feature-flag-state.service';

/**
 * Guard que bloquea una ruta si el feature flag indicado en route.data['featureFlag'] está desactivado.
 * Redirige al dashboard si el flag es false.
 */
export const featureFlagGuard: CanActivateFn = (route) => {
  const ff = inject(FeatureFlagStateService);
  const router = inject(Router);

  const flagKey = route.data?.['featureFlag'] as string | undefined;
  if (!flagKey || ff.isEnabled(flagKey)) return true;

  return router.createUrlTree(['/dashboard']);
};
