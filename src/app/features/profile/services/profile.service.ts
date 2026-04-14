import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/role.models';
import { User } from '../../../core/models/user.models';
import { ActiveSession, ChangePasswordRequest, DisableMfaRequest, EnableMfaRequest, ForceChangePasswordRequest, LinkProviderResponse, MfaSetupData, RequestChangeEmailRequest, SetPasswordRequest, UpdateProfileRequest } from '../models/profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly base = `${environment.apiUrl}/api/v1/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(this.base);
  }

  updateProfile(body: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(this.base, body);
  }

  changePassword(body: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.base}/password`, body);
  }

  getSessions(): Observable<ApiResponse<ActiveSession[]>> {
    return this.http.get<ApiResponse<ActiveSession[]>>(`${this.base}/sessions`);
  }

  revokeSession(tokenId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/sessions/${tokenId}`);
  }

  revokeAllSessions(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/api/v1/auth/revoke-all-token`, {});
  }

  setupMfa(): Observable<ApiResponse<MfaSetupData>> {
    return this.http.get<ApiResponse<MfaSetupData>>(`${this.base}/mfa/setup`);
  }

  enableMfa(body: EnableMfaRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/mfa/enable`, body);
  }

  disableMfa(body: DisableMfaRequest): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/mfa/disable`, { body });
  }

  requestChangeEmail(body: RequestChangeEmailRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.base}/email`, body);
  }

  setPassword(body: SetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/password`, body);
  }

  forceChangePassword(body: ForceChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/password/force`, body);
  }

  initLinkProvider(provider: string): Observable<ApiResponse<LinkProviderResponse>> {
    return this.http.get<ApiResponse<LinkProviderResponse>>(
      `${environment.apiUrl}/api/v1/auth/link/${provider}/init`,
      { withCredentials: true }
    );
  }
}
