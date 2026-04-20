import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { TokenService } from '../services/token.service';
import { RefreshTokenService } from '../../features/auth/services/refresh-token.service';

const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/register-final-user',
  '/api/v1/auth/refresh',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/confirmation-token',
];

function isPublic(url: string): boolean {
  return PUBLIC_PATHS.some(p => url.includes(p));
}

function addBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const authState = inject(AuthStateService);
  const refreshTokenService = inject(RefreshTokenService);
  const router = inject(Router);

  if (isPublic(req.url)) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();
  const authedReq = accessToken ? addBearer(req, accessToken) : req;

  return next(authedReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        return refreshTokenService.refresh().pipe(
          switchMap(tokens => {
            authState.setSessionFromJwt(tokens.expiresAt);
            return next(addBearer(req, tokens.accessToken));
          }),
          catchError(refreshErr => {
            authState.clearSession();
            const reason = refreshErr?.message === 'Token invalidado'
              ? 'session_invalidated'
              : 'session_expired';
            router.navigate(['/auth/login'], { queryParams: { reason } });
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
