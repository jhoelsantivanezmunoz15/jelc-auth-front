import { Injectable, computed, signal } from '@angular/core';
import { UserSession } from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  private readonly _session = signal<UserSession | null>(null);

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly currentRoles = computed(() => this._session()?.roles ?? []);
  readonly currentPermissions = computed(() => this._session()?.permissions ?? []);

  constructor(private tokenService: TokenService) {
    this.restoreFromStorage();
  }

  setSession(expiresAt: string): void {
    const token = this.tokenService.getAccessToken();
    if (!token) return;
    const payload = this.tokenService.decodePayload(token);
    this._session.set({
      email: payload.sub,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      expiresAt,
    });
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

  private restoreFromStorage(): void {
    if (this.tokenService.hasValidToken()) {
      const token = this.tokenService.getAccessToken()!;
      const payload = this.tokenService.decodePayload(token);
      this._session.set({
        email: payload.sub,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      });
    }
  }
}
