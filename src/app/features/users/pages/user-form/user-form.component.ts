import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserService } from '../../services/user.service';
import { RoleService } from '../../../roles/services/role.service';
import { Role } from '../../../../core/models/role.models';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId.set(id);
      this.form.get('email')!.disable();
      this.form.get('password')!.disable();
      this.loadUser(id);
    }
  }

  private loadRoles(): void {
    this.roleService.getAll(undefined, 0, 100).subscribe({
      next: res => this.availableRoles.set(res.data.content),
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
