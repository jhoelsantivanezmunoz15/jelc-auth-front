import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  ConfirmationTokenRequest,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  VoidResponse,
} from '../../../core/models/auth.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { TokenService } from '../../../core/services/token.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private authState: AuthStateService
  ) {}

  login(body: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/login`, body).pipe(
      tap(res => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.authState.setSession(res.expiresAt);
      })
    );
  }

  register(body: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/register`, body).pipe(
      tap(res => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.authState.setSession(res.expiresAt);
      })
    );
  }

  registerFinalUser(body: RegisterRequest): Observable<VoidResponse> {
    return this.http.post<VoidResponse>(`${this.base}/register-final-user`, body);
  }

  resetPassword(body: ResetPasswordRequest): Observable<VoidResponse> {
    return this.http.post<VoidResponse>(`${this.base}/reset-password`, body);
  }

  confirmToken(body: ConfirmationTokenRequest): Observable<VoidResponse> {
    return this.http.post<VoidResponse>(`${this.base}/confirmation-token`, body);
  }

  logout(): Observable<VoidResponse> {
    const refreshToken = this.tokenService.getRefreshToken() ?? '';
    const body: LogoutRequest = { refreshToken };
    return this.http.post<VoidResponse>(`${this.base}/logout`, body).pipe(
      tap(() => this.authState.clearSession())
    );
  }

  revokeAllTokens(): Observable<VoidResponse> {
    return this.http.post<VoidResponse>(`${this.base}/revoke-all-token`, {}).pipe(
      tap(() => this.authState.clearSession())
    );
  }
}
