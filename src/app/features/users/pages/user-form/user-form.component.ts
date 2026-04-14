import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserService } from '../../services/user.service';
import { RoleService } from '../../../roles/services/role.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { Role } from '../../../../core/models/role.models';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

const ROLE_LEVELS: Record<string, number> = { USER: 1, ADMIN: 2, SUPERADMIN: 3 };

const SUPERADMIN_ONLY_PERMISSIONS = new Set([
  'SYSTEM_CONFIG_READ',
  'SYSTEM_CONFIG_WRITE',
  'FEATURE_FLAG_READ',
  'FEATURE_FLAG_WRITE',
  'AUDIT_READ',
]);

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEdit = signal(false);
  userId = signal<string | null>(null);
  availableRoles = signal<Role[]>([]);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private authState: AuthStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roleIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.form.get('password')!.disable();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId.set(id);
      this.form.get('email')!.disable();
      this.loadUser(id);
    }
  }

  private loadRoles(): void {
    const callerLevel = Math.max(
      0,
      ...this.authState.currentRoles().map(r => ROLE_LEVELS[r] ?? 1)
    );
    const isSuperAdmin = this.authState.currentRoles().includes('SUPERADMIN');
    this.roleService.getAll(undefined, 0, 100).subscribe({
      next: res => {
        const filtered = res.data.content.filter(role => {
          if ((ROLE_LEVELS[role.name] ?? 1) > callerLevel) return false;
          if (!isSuperAdmin && role.permissions.some(p => SUPERADMIN_ONLY_PERMISSIONS.has(p.code))) return false;
          return true;
        });
        this.availableRoles.set(filtered);
      },
    });
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: res => {
        this.form.patchValue({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          roleIds: res.data.roles.map(r => r.id),
        });
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  isRoleSelected(roleId: string): boolean {
    return (this.form.value.roleIds as string[]).includes(roleId);
  }

  toggleRole(roleId: string): void {
    const current: string[] = this.form.value.roleIds ?? [];
    const updated = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];
    this.form.patchValue({ roleIds: updated });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.userService.update(this.userId()!, {
          firstName: this.form.value.firstName,
          lastName: this.form.value.lastName,
          roleIds: this.form.value.roleIds,
        })
      : this.userService.create(this.form.value);

    request$.subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
