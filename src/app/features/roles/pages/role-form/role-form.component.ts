import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEdit = signal(false);
  roleId = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.roleId.set(id);
      this.loadRole(id);
    }
  }

  private loadRole(id: string): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: res => {
        const role = res.data.find(r => r.id === id);
        if (role) {
          this.form.patchValue({
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(p => p.code),
          });
        }
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.roleService.update({ id: this.roleId()!, ...this.form.value })
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
