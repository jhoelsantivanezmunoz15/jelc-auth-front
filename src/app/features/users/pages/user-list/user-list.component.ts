import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { User, PageResult } from '../../../../core/models/user.models';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  search = signal('');
  blockedFilter = signal<boolean | undefined>(undefined);
  page = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService
      .getAll(this.search() || undefined, this.blockedFilter(), this.page(), this.pageSize())
      .subscribe({
        next: res => {
          const data: PageResult<User> = res.data;
          this.users.set(data.content);
          this.totalPages.set(data.totalPages);
          this.totalElements.set(data.totalElements);
          this.loading.set(false);
        },
        error: (err: BackendError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.search.set('');
    this.blockedFilter.set(undefined);
    this.page.set(0);
    this.load();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  toggleBlocked(user: User): void {
    this.userService.updateStatus(user.id, !user.blocked).subscribe({
      next: () => this.load(),
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  delete(userId: string): void {
    if (!confirm('¿Confirmas que deseas eliminar este usuario?')) return;
    this.userService.delete(userId).subscribe({
      next: () => this.load(),
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
