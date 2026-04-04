import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/role.models';
import { CreateUserRequest, PageResult, UpdateUserRequest, User } from '../../../core/models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/user`;

  create(body: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.base, body);
  }

  getAll(search?: string, blocked?: boolean, page = 0, size = 10): Observable<ApiResponse<PageResult<User>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (search) params = params.set('search', search);
    if (blocked !== undefined && blocked !== null) params = params.set('blocked', blocked);

    return this.http.get<ApiResponse<PageResult<User>>>(this.base, { params });
  }

  getById(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/${id}`);
  }

  update(id: string, body: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.base}/${id}`, body);
  }

  updateStatus(id: string, blocked: boolean): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.base}/${id}/status`, null, {
      params: new HttpParams().set('blocked', blocked),
    });
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }
}
