import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Role } from '../../../../core/models/role.models';
import { RoleService } from '../../services/role.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './role-list.component.html',
})
export class RoleListComponent implements OnInit {
  roles = signal<Role[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: res => {
        this.roles.set(res.data);
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  toggleActive(role: Role): void {
    this.roleService.toggleActive(role.id, !role).subscribe({
      next: () => this.load(),
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  delete(roleId: string): void {
    if (!confirm('¿Confirmas que deseas eliminar este rol?')) return;
    this.roleService.delete(roleId).subscribe({
      next: () => this.load(),
      error: (err: BackendError) => this.error.set(err.message),
    });
  }
}
