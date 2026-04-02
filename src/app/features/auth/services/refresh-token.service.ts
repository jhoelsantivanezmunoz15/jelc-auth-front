import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenResponse } from '../../../core/models/auth.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RefreshTokenService {
  private readonly base = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  refresh(refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/refresh`, { refreshToken });
  }
}
