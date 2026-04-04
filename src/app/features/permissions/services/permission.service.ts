import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Permission } from '../../../core/models/role.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly base = `${environment.apiUrl}/api/v1/permission`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(this.base);
  }
}
