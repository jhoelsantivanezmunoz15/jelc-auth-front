import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MenuStateService } from '../services/menu-state.service';
import { AuthStateService } from '../services/auth-state.service';

/**
 * Guard de rutas dinámico basado en el menú del usuario.
 *
 * Flujo:
 *  1. Verifica que el usuario esté autenticado.
 *  2. Llama a MenuStateService.load() — si el menú ya está en caché,
 *     resuelve instantáneamente sin petición HTTP.
 *  3. Extrae el primer segmento de la URL solicitada (p.ej. '/roles'
 *     de '/roles/edit/123') y comprueba si está en el árbol de menús.
 *  4. Si no tiene acceso → redirige al dashboard.
 *
 * Esto hace que las rutas sean dinámicas: añadir o quitar un elemento
 * del menú en el backend concede o revoca el acceso automáticamente,
 * sin cambiar una sola línea de código en el frontend.
 */
export const menuGuard: CanActivateFn = (_route, state: RouterStateSnapshot) => {
  const menuState = inject(MenuStateService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Obtener el segmento raíz de la URL: '/roles/edit/uuid' → '/roles'
  const segments = state.url.split('?')[0].split('/').filter(Boolean);
  const topLevel = segments.length > 0 ? '/' + segments[0] : '/';

  return menuState.load().pipe(
    map(() => {
      if (menuState.isRoutePermitted(topLevel)) return true;
      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/dashboard']))),
  );
};
