import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuNode } from '../models/menu.models';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly base = `${environment.apiUrl}/api/v1/menu`;

  constructor(private http: HttpClient) {}

  getMenuForCurrentUser(): Observable<ApiResponse<MenuNode[]>> {
    return this.http.get<ApiResponse<MenuNode[]>>(this.base);
  }
}
