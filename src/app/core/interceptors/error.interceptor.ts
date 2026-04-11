import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';

export interface BackendError {
  status: number;
  message: string;
  exception: string;
  path: string;
  errors?: Record<string, string>;
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authState = inject(AuthStateService);

  return next(req).pipe(
    catchError(err => {
      const backendError: BackendError = {
        status: err.status,
        message: err.error?.message ?? 'Error inesperado',
        exception: err.error?.exception ?? '',
        path: err.error?.path ?? req.url,
        errors: err.error?.errors ?? {},
      };

      if (err.status === 401) {
        authState.clearSession();
        router.navigate(['/auth/login']);
      }

      if (err.status === 0) {
        backendError.message = 'No se pudo conectar con el servidor';
      }

      return throwError(() => backendError);
    })
  );
};
