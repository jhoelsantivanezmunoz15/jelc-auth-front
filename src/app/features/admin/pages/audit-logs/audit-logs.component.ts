import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { AdminService } from '../../services/admin.service';
import { AuditAction, AuditLog, AuditLogFilters } from '../../models/admin.models';
import { PageResult } from '../../../../core/models/role.models';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  logs = signal<AuditLog[]>([]);
  page = signal<PageResult<AuditLog> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  filters: AuditLogFilters = { page: 0, size: 20 };
  selectedAction: AuditAction | '' = '';
  performedBy = '';
  dateFrom = '';
  dateTo = '';

  readonly actions: AuditAction[] = [
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH',
    'TOKEN_THEFT_DETECTED', 'USER_REGISTERED', 'EMAIL_CONFIRMED',
    'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
  ];

  readonly actionLabels: Record<AuditAction, string> = {
    LOGIN_SUCCESS: 'Login exitoso',
    LOGIN_FAILED: 'Login fallido',
    LOGOUT: 'Cierre de sesión',
    TOKEN_REFRESH: 'Refresh de token',
    TOKEN_THEFT_DETECTED: 'Robo de token detectado',
    USER_REGISTERED: 'Registro de usuario',
    EMAIL_CONFIRMED: 'Email confirmado',
    PASSWORD_RESET_REQUESTED: 'Reseteo de contraseña solicitado',
    PASSWORD_RESET_COMPLETED: 'Reseteo de contraseña completado',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const f: AuditLogFilters = { page: this.filters.page, size: this.filters.size };
    if (this.selectedAction) f.action = this.selectedAction;
    if (this.performedBy.trim()) f.performedBy = this.performedBy.trim();
    if (this.dateFrom) f.dateFrom = new Date(this.dateFrom).toISOString();
    if (this.dateTo) f.dateTo = new Date(this.dateTo + 'T23:59:59').toISOString();

    this.adminService.getAuditLogs(f).subscribe({
      next: res => {
        this.page.set(res.data);
        this.logs.set(res.data.content);
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.filters.page = 0;
    this.load();
  }

  clearFilters(): void {
    this.selectedAction = '';
    this.performedBy = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filters.page = 0;
    this.load();
  }

  goToPage(p: number): void {
    this.filters.page = p;
    this.load();
  }

  get totalPages(): number {
    return this.page()?.totalPages ?? 0;
  }

  get currentPage(): number {
    return this.filters.page;
  }

  actionLabel(action: AuditAction): string {
    return this.actionLabels[action] ?? action;
  }

  actionClass(action: AuditAction): string {
    switch (action) {
      case 'LOGIN_SUCCESS': return 'bg-green-100 text-green-800';
      case 'LOGIN_FAILED': return 'bg-red-100 text-red-800';
      case 'TOKEN_THEFT_DETECTED': return 'bg-red-200 text-red-900 font-semibold';
      case 'LOGOUT': return 'bg-gray-100 text-gray-700';
      case 'USER_REGISTERED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'medium' });
  }
}
