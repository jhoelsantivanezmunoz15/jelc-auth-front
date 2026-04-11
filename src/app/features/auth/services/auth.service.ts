import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
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

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private authState: AuthStateService
  ) {}

  login(body: LoginRequest): Observable<TokenResponse> {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.base}/login`, body).pipe(
      map(res => res.data),
      tap(res => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.authState.setSession(res.expiresAt);
      })
    );
  }

  register(body: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.base}/register`, body).pipe(
      map(res => res.data),
      tap(res => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.authState.setSession(res.expiresAt);
      })
    );
  }

  registerFinalUser(body: RegisterRequest): Observable<VoidResponse> {
    return this.http.post<ApiResponse<VoidResponse>>(`${this.base}/register-final-user`, body).pipe(
      map(res => res.data)
    );
  }

  resetPassword(body: ResetPasswordRequest): Observable<VoidResponse> {
    return this.http.post<ApiResponse<VoidResponse>>(`${this.base}/reset-password`, body).pipe(
      map(res => res.data)
    );
  }

  confirmToken(body: ConfirmationTokenRequest): Observable<VoidResponse> {
    return this.http.post<ApiResponse<VoidResponse>>(`${this.base}/confirmation-token`, body).pipe(
      map(res => res.data)
    );
  }

  logout(): Observable<VoidResponse> {
    const refreshToken = this.tokenService.getRefreshToken() ?? '';
    const body: LogoutRequest = { refreshToken };
    return this.http.post<ApiResponse<VoidResponse>>(`${this.base}/logout`, body).pipe(
      map(res => res.data),
      tap(() => this.authState.clearSession())
    );
  }

  revokeAllTokens(): Observable<VoidResponse> {
    return this.http.post<ApiResponse<VoidResponse>>(`${this.base}/revoke-all-token`, {}).pipe(
      map(res => res.data),
      tap(() => this.authState.clearSession())
    );
  }
}
