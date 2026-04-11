import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { FeatureFlagStateService } from '../../../../core/services/feature-flag-state.service';
import { environment } from '../../../../../environments/environment';

type LoginStep = 'credentials' | 'mfa';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  step = signal<LoginStep>('credentials');
  form: FormGroup;
  mfaForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  private challengeToken = '';

  readonly registrationOpen;
  readonly passwordResetEnabled;
  readonly oauth2Enabled;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ff: FeatureFlagStateService
  ) {
    this.registrationOpen = this.ff.registrationOpen;
    this.passwordResetEnabled = this.ff.passwordResetEnabled;
    this.oauth2Enabled = this.ff.oauth2Enabled;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit(): void {
    this.ff.load();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.mfaRequired) {
          this.challengeToken = res.challengeToken;
          this.step.set('mfa');
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  submitMfa(): void {
    if (this.mfaForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.verifyMfa(this.challengeToken, this.mfaForm.value.code).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  backToCredentials(): void {
    this.step.set('credentials');
    this.challengeToken = '';
    this.mfaForm.reset();
    this.error.set(null);
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }
}
