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
    'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'PASSWORD_CHANGED',
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_BLOCKED', 'USER_UNBLOCKED',
    'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED',
    'FEATURE_FLAG_CREATED', 'FEATURE_FLAG_TOGGLED', 'FEATURE_FLAG_DELETED',
    'SYSTEM_CONFIG_CREATED', 'SYSTEM_CONFIG_UPDATED', 'SYSTEM_CONFIG_DELETED',
    'MFA_ENABLED', 'MFA_DISABLED', 'MFA_CHALLENGE_VERIFIED', 'MFA_CHALLENGE_FAILED',
    'OAUTH2_LOGIN',
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
    PASSWORD_CHANGED: 'Contraseña cambiada',
    USER_CREATED: 'Usuario creado',
    USER_UPDATED: 'Usuario actualizado',
    USER_DELETED: 'Usuario eliminado',
    USER_BLOCKED: 'Usuario bloqueado',
    USER_UNBLOCKED: 'Usuario desbloqueado',
    ROLE_CREATED: 'Rol creado',
    ROLE_UPDATED: 'Rol actualizado',
    ROLE_DELETED: 'Rol eliminado',
    FEATURE_FLAG_CREATED: 'Feature flag creado',
    FEATURE_FLAG_TOGGLED: 'Feature flag activado/desactivado',
    FEATURE_FLAG_DELETED: 'Feature flag eliminado',
    SYSTEM_CONFIG_CREATED: 'Config. creada',
    SYSTEM_CONFIG_UPDATED: 'Config. actualizada',
    SYSTEM_CONFIG_DELETED: 'Config. eliminada',
    MFA_ENABLED: 'MFA activado',
    MFA_DISABLED: 'MFA desactivado',
    MFA_CHALLENGE_VERIFIED: 'MFA verificado',
    MFA_CHALLENGE_FAILED: 'MFA fallido',
    OAUTH2_LOGIN: 'Login social',
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
      case 'USER_REGISTERED':
      case 'USER_CREATED': return 'bg-blue-100 text-blue-800';
      case 'USER_DELETED':
      case 'ROLE_DELETED':
      case 'FEATURE_FLAG_DELETED':
      case 'SYSTEM_CONFIG_DELETED': return 'bg-red-100 text-red-800';
      case 'USER_BLOCKED': return 'bg-orange-100 text-orange-800';
      case 'USER_UNBLOCKED': return 'bg-green-100 text-green-700';
      case 'ROLE_CREATED':
      case 'FEATURE_FLAG_CREATED':
      case 'SYSTEM_CONFIG_CREATED': return 'bg-teal-100 text-teal-800';
      case 'ROLE_UPDATED':
      case 'USER_UPDATED':
      case 'SYSTEM_CONFIG_UPDATED': return 'bg-yellow-100 text-yellow-800';
      case 'FEATURE_FLAG_TOGGLED': return 'bg-purple-100 text-purple-800';
      case 'PASSWORD_CHANGED': return 'bg-amber-100 text-amber-800';
      case 'MFA_ENABLED':
      case 'MFA_CHALLENGE_VERIFIED': return 'bg-indigo-100 text-indigo-800';
      case 'MFA_DISABLED': return 'bg-gray-100 text-gray-700';
      case 'MFA_CHALLENGE_FAILED': return 'bg-red-100 text-red-800';
      case 'OAUTH2_LOGIN': return 'bg-sky-100 text-sky-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  }

  exportCsv(): void {
    const filters: Omit<AuditLogFilters, 'page' | 'size'> = {};
    if (this.selectedAction) filters.action = this.selectedAction;
    if (this.performedBy.trim()) filters.performedBy = this.performedBy.trim();
    if (this.dateFrom) filters.dateFrom = new Date(this.dateFrom).toISOString();
    if (this.dateTo) filters.dateTo = new Date(this.dateTo + 'T23:59:59').toISOString();

    this.adminService.exportAuditLogs(filters).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err: BackendError) => {
        this.error.set(err.message ?? 'Error al exportar');
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'medium' });
  }
}
