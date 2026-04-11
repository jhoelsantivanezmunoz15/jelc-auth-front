import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/role.models';
import {
  AuditLog,
  AuditLogFilters,
  ConfigCategory,
  CreateFeatureFlagRequest,
  CreateSystemConfigRequest,
  FeatureFlag,
  SystemConfig,
} from '../models/admin.models';
import { PageResult } from '../../../core/models/role.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly flagsBase = `${environment.apiUrl}/api/v1/feature-flags`;
  private readonly configBase = `${environment.apiUrl}/api/v1/system-config`;
  private readonly auditBase = `${environment.apiUrl}/api/v1/audit-logs`;

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

  // ── Audit Logs ───────────────────────────────────────────────────────────

  getAuditLogs(filters: AuditLogFilters): Observable<ApiResponse<PageResult<AuditLog>>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());
    if (filters.action) params = params.set('action', filters.action);
    if (filters.performedBy) params = params.set('performedBy', filters.performedBy);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    return this.http.get<ApiResponse<PageResult<AuditLog>>>(this.auditBase, { params });
  }

  exportAuditLogs(filters: Omit<AuditLogFilters, 'page' | 'size'>): Observable<Blob> {
    let params = new HttpParams();
    if (filters.action) params = params.set('action', filters.action);
    if (filters.performedBy) params = params.set('performedBy', filters.performedBy);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    return this.http.get(`${this.auditBase}/export`, { params, responseType: 'blob' });
  }
}
