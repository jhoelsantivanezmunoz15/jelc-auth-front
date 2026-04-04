import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { MenuStateService } from '../../../../core/services/menu-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  // ─── Saludo según la hora del día ────────────────────────────────────────
  readonly greeting: string = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  // ─── Estadísticas de sesión ───────────────────────────────────────────────
  readonly roleCount = computed(() => this.authState.currentRoles().length);
  readonly permissionCount = computed(() => this.authState.currentPermissions().length);
  readonly moduleCount = computed(() => this.menuState.tree().length);

  // ─── Tiempo restante del token ────────────────────────────────────────────
  readonly tokenExpiresIn = signal('–');
  readonly tokenExpired = signal(false);

  // ─── Acceso rápido (nodos raíz del menú que tienen ruta) ─────────────────
  readonly quickAccessItems = computed(() =>
    this.menuState.tree().filter(n => !!n.route)
  );

  constructor(
    public authState: AuthStateService,
    public menuState: MenuStateService,
  ) {}

  ngOnInit(): void {
    this.menuState.load().subscribe();
    this.computeTokenExpiry();
  }

  private computeTokenExpiry(): void {
    const expiresAt = this.authState.session()?.expiresAt;
    if (!expiresAt) return;

    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) {
      this.tokenExpired.set(true);
      this.tokenExpiresIn.set('Expirado');
      return;
    }

    const h = Math.floor(diffMs / 3_600_000);
    const m = Math.floor((diffMs % 3_600_000) / 60_000);
    this.tokenExpiresIn.set(h > 0 ? `${h}h ${m}m` : `${m}m`);
  }
}
