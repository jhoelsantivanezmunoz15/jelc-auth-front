import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class FeatureFlagStateService {

  private readonly _flags = signal<Record<string, boolean>>({});

  readonly flags = this._flags.asReadonly();

  readonly registrationOpen = computed(() => this._flags()['REGISTRATION_OPEN'] ?? true);
  readonly emailVerification = computed(() => this._flags()['EMAIL_VERIFICATION'] ?? true);
  readonly passwordResetEnabled = computed(() => this._flags()['PASSWORD_RESET_ENABLED'] ?? true);
  readonly mfaEnabled = computed(() => this._flags()['MFA_ENABLED'] ?? false);
  readonly oauth2Enabled = computed(() => this._flags()['OAUTH2_ENABLED'] ?? false);

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<Record<string, boolean>>>(
          `${environment.apiUrl}/api/v1/feature-flags/public`
        )
      );
      this._flags.set(res.data);
    } catch {
      // silently keep defaults if the endpoint fails
    }
  }

  isEnabled(key: string): boolean {
    return this._flags()[key] ?? true;
  }
}
