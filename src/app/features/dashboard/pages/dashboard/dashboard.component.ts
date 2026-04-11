import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly greeting: string = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  constructor(
    public authState: AuthStateService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: res => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.loading.set(false);
        if (err.status !== 403) {
          this.error.set('No se pudieron cargar las estadísticas del sistema.');
        }
        // 403: usuario sin permisos de admin — simplemente no mostrar stats
      },
    });
  }

  actionClass(action: string): string {
    if (action.includes('FAILED') || action.includes('DELETED') || action.includes('BLOCKED')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('CREATED') || action.includes('REGISTERED') || action.includes('SUCCESS')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('UPDATED') || action.includes('TOGGLED') || action.includes('CHANGED')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (action.includes('THEFT') || action.includes('LOCKED')) {
      return 'bg-red-200 text-red-900 font-semibold';
    }
    return 'bg-gray-100 text-gray-700';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
  }
}
