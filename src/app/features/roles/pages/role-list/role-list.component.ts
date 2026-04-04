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
  search = signal('');
  page = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.roleService.getAll(this.search() || undefined, this.page(), this.pageSize()).subscribe({
      next: res => {
        this.roles.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.totalElements.set(res.data.totalElements);
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  applySearch(): void {
    this.page.set(0);
    this.load();
  }

  clearSearch(): void {
    this.search.set('');
    this.page.set(0);
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  toggleActive(role: Role): void {
    this.roleService.toggleActive(role.id, !role.active).subscribe({
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
