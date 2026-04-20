import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

import { MeResponse, UserSession } from '../models/auth.models';
import { ApiResponse } from '../models/role.models';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  private readonly meUrl = `${environment.apiUrl}/api/v1/profile/me`;

  private readonly _session = signal<UserSession | null>(null);

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly currentRoles = computed(() => this._session()?.roles ?? []);
  readonly currentPermissions = computed(() => this._session()?.permissions ?? []);
  readonly mustChangePassword = computed(() => this._session()?.mustChangePassword ?? false);

  constructor(
    private tokenService: TokenService,
    private http: HttpClient
  ) {
    this.restoreFromStorage();
  }

  /**
   * Llamado en APP_INITIALIZER y después de login/refresh.
   * Carga roles + permisos frescos desde el backend y actualiza la sesión.
   */
  initSession(): Observable<void> {
    if (!this.tokenService.hasValidToken()) {
      this._session.set(null);
      return of(undefined);
    }

    return this.http.get<ApiResponse<MeResponse>>(this.meUrl).pipe(
      tap(res => this.applyMe(res.data)),
      catchError(() => {
        this.clearSession();
        return of(undefined);
      }),
    ) as Observable<void>;
  }

  /**
   * Actualiza la sesión desde el JWT nuevo tras un refresh de token,
   * preservando los permisos ya cargados (no cambiaron, solo expiró el token).
   */
  setSessionFromJwt(expiresAt: string): void {
    const token = this.tokenService.getAccessToken();
    if (!token) return;
    const payload = this.tokenService.decodePayload(token);
    this._session.update(current => ({
      email: payload.sub,
      roles: payload.roles ?? [],
      permissions: current?.permissions ?? [],
      expiresAt,
      mustChangePassword: payload.mustChangePassword ?? false,
    }));
  }

  clearSession(): void {
    this._session.set(null);
    this.tokenService.clearTokens();
  }

  hasPermission(permission: string): boolean {
    return this.currentPermissions().includes(permission);
  }

  hasRole(role: string): boolean {
    return this.currentRoles().includes(role);
  }

  private applyMe(me: MeResponse): void {
    const token = this.tokenService.getAccessToken();
    const expiresAt = token
      ? new Date(this.tokenService.decodePayload(token).exp * 1000).toISOString()
      : '';
    this._session.set({
      email: me.email,
      roles: me.roles ?? [],
      permissions: me.permissions ?? [],
      expiresAt,
      mustChangePassword: me.mustChangePassword,
    });
  }

  private restoreFromStorage(): void {
    if (this.tokenService.hasValidToken()) {
      const token = this.tokenService.getAccessToken()!;
      const payload = this.tokenService.decodePayload(token);
      // Placeholder hasta que APP_INITIALIZER cargue los permisos reales
      this._session.set({
        email: payload.sub,
        roles: payload.roles ?? [],
        permissions: [],
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        mustChangePassword: payload.mustChangePassword ?? false,
      });
    }
  }
}
