import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/role.models';
import {
  ConfigCategory,
  CreateFeatureFlagRequest,
  CreateSystemConfigRequest,
  FeatureFlag,
  SystemConfig,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly flagsBase = `${environment.apiUrl}/api/v1/feature-flags`;
  private readonly configBase = `${environment.apiUrl}/api/v1/system-config`;

  constructor(private http: HttpClient) {}

  // ── Feature Flags ────────────────────────────────────────────────────────

  getFlags(): Observable<ApiResponse<FeatureFlag[]>> {
    return this.http.get<ApiResponse<FeatureFlag[]>>(this.flagsBase);
  }

  createFlag(body: CreateFeatureFlagRequest): Observable<ApiResponse<FeatureFlag>> {
    return this.http.post<ApiResponse<FeatureFlag>>(this.flagsBase, body);
  }

  toggleFlag(id: string, enabled: boolean): Observable<ApiResponse<FeatureFlag>> {
    return this.http.patch<ApiResponse<FeatureFlag>>(`${this.flagsBase}/${id}`, { enabled });
  }

  deleteFlag(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.flagsBase}/${id}`);
  }

  // ── System Config ────────────────────────────────────────────────────────

  getConfigs(category?: ConfigCategory): Observable<ApiResponse<SystemConfig[]>> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<SystemConfig[]>>(this.configBase, { params });
  }

  createConfig(body: CreateSystemConfigRequest): Observable<ApiResponse<SystemConfig>> {
    return this.http.post<ApiResponse<SystemConfig>>(this.configBase, body);
  }

  updateConfig(id: string, value: string): Observable<ApiResponse<SystemConfig>> {
    return this.http.put<ApiResponse<SystemConfig>>(`${this.configBase}/${id}`, { value });
  }

  deleteConfig(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.configBase}/${id}`);
  }
}
