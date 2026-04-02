import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateHabitRequest, HabitResponse } from '../../../core/models/habit.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly base = `${environment.apiUrl}/api/v1/habits`;

  constructor(private http: HttpClient) {}

  create(body: CreateHabitRequest): Observable<HabitResponse> {
    return this.http.post<HabitResponse>(this.base, body);
  }
}
