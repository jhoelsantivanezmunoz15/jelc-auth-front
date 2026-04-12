import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { TokenService } from '../services/token.service';

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

  if (isPublic(req.url)) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();
  const authedReq = accessToken ? addBearer(req, accessToken) : req;

  return next(authedReq).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken = tokenService.getRefreshToken();
        if (refreshToken) {
          return inject(RefreshTokenService).refresh(refreshToken).pipe(
            switchMap(tokens => {
              tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
              authState.setSession(tokens.expiresAt);
              return next(addBearer(req, tokens.accessToken));
            }),
            catchError(refreshErr => {
              authState.clearSession();
              return throwError(() => refreshErr);
            })
          );
        }
        authState.clearSession();
      }
      return throwError(() => err);
    })
  );
};

// Forward declaration to avoid circular dependency
import { RefreshTokenService } from '../../features/auth/services/refresh-token.service';
