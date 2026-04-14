import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { ProfileService } from '../../../profile/services/profile.service';

@Component({
  selector: 'app-force-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './force-change-password.component.html',
})
export class ForceChangePasswordComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authState: AuthStateService,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const newPassword = this.form.value.newPassword as string;
    const confirmPassword = this.form.value.confirmPassword as string;

    this.error.set(null);
    if (newPassword !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.profileService.forceChangePassword({ newPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Contrasena actualizada. Inicia sesion nuevamente.');
        this.authState.clearSession();
        setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { reason: 'mustChangePassword' } }), 1500);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
