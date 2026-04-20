import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, switchMap, take, tap, throwError } from 'rxjs';
import { TokenResponse } from '../../../core/models/auth.models';
import { TokenService } from '../../../core/services/token.service';
import { environment } from '../../../../environments/environment';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class RefreshTokenService {
  private readonly url = `${environment.apiUrl}/api/v1/auth/refresh`;

  private refreshing = false;
  private refresh$ = new BehaviorSubject<TokenResponse | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  /**
   * Llama al endpoint de refresh. Si ya hay un refresh en curso,
   * encola el caller y espera el resultado del refresh activo.
   */
  refresh(): Observable<TokenResponse> {
    if (this.refreshing) {
      return this.refresh$.pipe(
        filter(tokens => tokens !== null),
        take(1),
        map(tokens => tokens!)
      );
    }

    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    this.refreshing = true;
    this.refresh$.next(null);

    return this.http.post<ApiResponse<TokenResponse>>(this.url, { refreshToken }).pipe(
      map(res => res.data),
      tap(tokens => {
        this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
        this.refreshing = false;
        this.refresh$.next(tokens);
      }),
      switchMap(() =>
        this.refresh$.pipe(
          filter(t => t !== null),
          take(1),
          map(t => t!)
        )
      )
    );
  }
}
