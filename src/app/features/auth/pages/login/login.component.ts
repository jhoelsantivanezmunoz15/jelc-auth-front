import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { FeatureFlagStateService } from '../../../../core/services/feature-flag-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  readonly registrationOpen;
  readonly passwordResetEnabled;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ff: FeatureFlagStateService
  ) {
    this.registrationOpen = this.ff.registrationOpen;
    this.passwordResetEnabled = this.ff.passwordResetEnabled;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
