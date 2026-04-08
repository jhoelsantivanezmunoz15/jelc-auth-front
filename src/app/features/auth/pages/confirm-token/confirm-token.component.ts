import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { ConfirmationTokenRequest } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-confirm-token',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-token.component.html',
})
export class ConfirmTokenComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  isPasswordReset = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      confirmationToken: ['', Validators.required],
      newPassword: [''],
    });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const type = this.route.snapshot.queryParamMap.get('type');

    if (token) this.form.patchValue({ confirmationToken: token });

    if (type === 'password-reset') {
      this.isPasswordReset.set(true);
      this.form.get('newPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('newPassword')?.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const payload: ConfirmationTokenRequest = {
      confirmationToken: this.form.value.confirmationToken,
      ...(this.isPasswordReset() && { newPassword: this.form.value.newPassword }),
    };

    this.authService.confirmToken(payload).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
