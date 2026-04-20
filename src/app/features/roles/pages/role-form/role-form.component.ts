import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../../permissions/services/permission.service';
import { Permission, RoleType } from '../../../../core/models/role.models';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

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
  allPermissions = signal<Permission[]>([]);
  availablePermissions = signal<Permission[]>([]);

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      roleType: ['BUSINESS', Validators.required],
      permissions: [[]],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.form.get('roleType')!.valueChanges.subscribe(() => this.filterPermissions());
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.roleId.set(id);
      this.form.get('roleType')!.disable();
      this.loadRole(id);
    }
  }

  private loadPermissions(): void {
    this.permissionService.getAll().subscribe({
      next: res => {
        this.allPermissions.set(res.data);
        this.filterPermissions();
      },
    });
  }

  private filterPermissions(): void {
    const roleType: RoleType = this.form.get('roleType')!.value ?? 'BUSINESS';
    this.availablePermissions.set(
      this.allPermissions().filter(p => p.permissionType === roleType)
    );
  }

  private loadRole(id: string): void {
    this.loading.set(true);
    this.roleService.getById(id).subscribe({
      next: res => {
        this.form.patchValue({
          name: res.data.name,
          description: res.data.description,
          roleType: res.data.roleType ?? 'BUSINESS',
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
