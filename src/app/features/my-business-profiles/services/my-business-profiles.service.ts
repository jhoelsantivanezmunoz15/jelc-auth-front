import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PageResult } from '../../../core/models/role.models';
import {
  AssignableRole,
  BusinessProfile,
  BusinessContext,
  BusinessProfileForm,
  BusinessContextForm,
} from '../models/my-business-profiles.models';

@Injectable({ providedIn: 'root' })
export class MyBusinessProfilesService {
  private readonly http = inject(HttpClient);
  private readonly profileBase = `${environment.apiUrl}/api/v1/business-profile`;
  private readonly contextBase = `${environment.apiUrl}/api/v1/business-context`;
  private readonly profileRolesUrl = `${environment.apiUrl}/api/v1/profile/roles`;

  // ─── Business Profiles ───────────────────────────────────────────────────

  getProfiles(search?: string, page = 0, size = 10): Observable<ApiResponse<PageResult<BusinessProfile>>> {
    const params: Record<string, string | number> = { page, size };
    if (search) params['search'] = search;
    return this.http.get<ApiResponse<PageResult<BusinessProfile>>>(this.profileBase, { params });
  }

  getProfileById(id: string): Observable<ApiResponse<BusinessProfile>> {
    return this.http.get<ApiResponse<BusinessProfile>>(`${this.profileBase}/${id}`);
  }

  createProfile(body: BusinessProfileForm): Observable<ApiResponse<BusinessProfile>> {
    return this.http.post<ApiResponse<BusinessProfile>>(this.profileBase, body);
  }

  updateProfile(id: string, body: BusinessProfileForm): Observable<ApiResponse<BusinessProfile>> {
    return this.http.put<ApiResponse<BusinessProfile>>(`${this.profileBase}/${id}`, body);
  }

  deleteProfile(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.profileBase}/${id}`);
  }

  assignRoles(profileId: string, roleIds: string[]): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.profileBase}/${profileId}/roles`, { roleIds });
  }

  // ─── Business Contexts ───────────────────────────────────────────────────

  getContexts(search?: string, page = 0, size = 10): Observable<ApiResponse<PageResult<BusinessContext>>> {
    const params: Record<string, string | number> = { page, size };
    if (search) params['search'] = search;
    return this.http.get<ApiResponse<PageResult<BusinessContext>>>(this.contextBase, { params });
  }

  createContext(body: BusinessContextForm): Observable<ApiResponse<BusinessContext>> {
    return this.http.post<ApiResponse<BusinessContext>>(this.contextBase, body);
  }

  updateContext(id: string, body: BusinessContextForm): Observable<ApiResponse<BusinessContext>> {
    return this.http.put<ApiResponse<BusinessContext>>(`${this.contextBase}/${id}`, body);
  }

  deleteContext(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.contextBase}/${id}`);
  }

  // ─── Roles (for assignment) ───────────────────────────────────────────────

  getAssignableRoles(): Observable<ApiResponse<AssignableRole[]>> {
    return this.http.get<ApiResponse<AssignableRole[]>>(this.profileRolesUrl);
  }
}
