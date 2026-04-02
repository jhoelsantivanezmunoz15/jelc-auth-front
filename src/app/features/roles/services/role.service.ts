import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, CreateRoleRequest, Role, UpdateRoleRequest } from '../../../core/models/role.models';
import { VoidResponse } from '../../../core/models/auth.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly base = `${environment.apiUrl}/api/v1/role`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.base}/getAll`);
  }

  create(body: CreateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.base}/create`, body);
  }

  update(body: UpdateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.base}/update`, body);
  }

  toggleActive(roleId: string, active: boolean): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.base}/${roleId}/${active}`, {});
  }

  delete(roleId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/delete/${roleId}`);
  }
}
