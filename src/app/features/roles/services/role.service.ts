import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateRoleRequest, PageResult, Role, UpdateRoleRequest } from '../../../core/models/role.models';
import { VoidResponse } from '../../../core/models/auth.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly base = `${environment.apiUrl}/api/v1/role`;

  constructor(private http: HttpClient) {}

  getAll(search?: string, page = 0, size = 10): Observable<ApiResponse<PageResult<Role>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<PageResult<Role>>>(`${this.base}`, { params });
  }

  getById(id: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.base}/${id}`);
  }

  create(body: CreateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.base}`, body);
  }

  update(id: string, body: UpdateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.base}/${id}`, body);
  }

  toggleActive(roleId: string, active: boolean): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.base}/${roleId}/status`, { active });
  }

  delete(roleId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${roleId}`);
  }
}
