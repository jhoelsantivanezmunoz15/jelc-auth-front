import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../../permissions/services/permission.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { Permission } from '../../../../core/models/role.models';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

const SUPERADMIN_ONLY_PERMISSIONS = new Set([
  'SYSTEM_CONFIG_READ',
  'SYSTEM_CONFIG_WRITE',
  'FEATURE_FLAG_READ',
  'FEATURE_FLAG_WRITE',
  'AUDIT_READ',
]);

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEdit = signal(false);
  roleId = signal<string | null>(null);
  availablePermissions = signal<Permission[]>([]);

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private authState: AuthStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      permissions: [[]],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.roleId.set(id);
      this.loadRole(id);
    }
  }

  private loadPermissions(): void {
    const isSuperAdmin = this.authState.currentRoles().includes('SUPERADMIN');
    this.permissionService.getAll().subscribe({
      next: res => {
        const filtered = isSuperAdmin
          ? res.data
          : res.data.filter(p => !SUPERADMIN_ONLY_PERMISSIONS.has(p.code));
        this.availablePermissions.set(filtered);
      },
    });
  }

  private loadRole(id: string): void {
    this.loading.set(true);
    this.roleService.getById(id).subscribe({
      next: res => {
        this.form.patchValue({
          name: res.data.name,
          description: res.data.description,
          permissions: res.data.permissions.map(p => p.code),
        });
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  isPermissionSelected(code: string): boolean {
    return (this.form.value.permissions as string[]).includes(code);
  }

  togglePermission(code: string): void {
    const current: string[] = this.form.value.permissions ?? [];
    const updated = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];
    this.form.patchValue({ permissions: updated });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.roleService.update(this.roleId()!, this.form.value)
      : this.roleService.create(this.form.value);

    request$.subscribe({
      next: () => this.router.navigate(['/roles']),
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
