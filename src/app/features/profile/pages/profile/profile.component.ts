import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { User } from '../../../../core/models/user.models';
import { ProfileService } from '../../services/profile.service';
import { ActiveSession, ChangePasswordRequest, UpdateProfileRequest } from '../../models/profile.models';

type Tab = 'info' | 'password' | 'sessions';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  activeTab = signal<Tab>('info');

  // ─── Profile info ────────────────────────────────────────────────────────
  user = signal<User | null>(null);
  loadingProfile = signal(false);
  savingProfile = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);

  profileForm: UpdateProfileRequest = { firstName: '', lastName: '' };

  // ─── Change password ─────────────────────────────────────────────────────
  passwordForm: ChangePasswordRequest = { currentPassword: '', newPassword: '' };
  confirmPassword = '';
  savingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  // ─── Sessions ────────────────────────────────────────────────────────────
  sessions = signal<ActiveSession[]>([]);
  loadingSessions = signal(false);
  sessionsError = signal<string | null>(null);
  revokingId = signal<string | null>(null);

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'sessions' && this.sessions().length === 0) {
      this.loadSessions();
    }
  }

  // ─── Profile info ────────────────────────────────────────────────────────

  loadProfile(): void {
    this.loadingProfile.set(true);
    this.profileError.set(null);
    this.profileService.getProfile().subscribe({
      next: res => {
        this.user.set(res.data);
        this.profileForm = { firstName: res.data.firstName, lastName: res.data.lastName };
        this.loadingProfile.set(false);
      },
      error: (err: BackendError) => {
        this.profileError.set(err.message);
        this.loadingProfile.set(false);
      },
    });
  }

  saveProfile(): void {
    if (!this.profileForm.firstName.trim() || !this.profileForm.lastName.trim()) return;
    this.savingProfile.set(true);
    this.profileError.set(null);
    this.profileService.updateProfile(this.profileForm).subscribe({
      next: res => {
        this.user.set(res.data);
        this.showProfileSuccess('Perfil actualizado correctamente');
        this.savingProfile.set(false);
      },
      error: (err: BackendError) => {
        this.profileError.set(err.message);
        this.savingProfile.set(false);
      },
    });
  }

  // ─── Change password ─────────────────────────────────────────────────────

  changePassword(): void {
    this.passwordError.set(null);
    if (this.passwordForm.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas nuevas no coinciden');
      return;
    }
    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError.set('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    this.savingPassword.set(true);
    this.profileService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.passwordForm = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';
        this.showPasswordSuccess('Contraseña actualizada correctamente');
        this.savingPassword.set(false);
      },
      error: (err: BackendError) => {
        this.passwordError.set(err.message);
        this.savingPassword.set(false);
      },
    });
  }

  // ─── Sessions ────────────────────────────────────────────────────────────

  revokingAll = signal(false);

  revokeAllSessions(): void {
    if (!confirm('¿Cerrar todas las sesiones activas? Tendrás que volver a iniciar sesión.')) return;
    this.revokingAll.set(true);
    this.profileService.revokeAllSessions().subscribe({
      next: () => {
        this.sessions.set([]);
        this.revokingAll.set(false);
      },
      error: (err: BackendError) => {
        this.sessionsError.set(err.message);
        this.revokingAll.set(false);
      },
    });
  }

  loadSessions(): void {
    this.loadingSessions.set(true);
    this.sessionsError.set(null);
    this.profileService.getSessions().subscribe({
      next: res => {
        this.sessions.set(res.data);
        this.loadingSessions.set(false);
      },
      error: (err: BackendError) => {
        this.sessionsError.set(err.message);
        this.loadingSessions.set(false);
      },
    });
  }

  revokeSession(id: string): void {
    if (!confirm('¿Cerrar esta sesión?')) return;
    this.revokingId.set(id);
    this.profileService.revokeSession(id).subscribe({
      next: () => {
        this.sessions.update(list => list.filter(s => s.id !== id));
        this.revokingId.set(null);
      },
      error: (err: BackendError) => {
        this.sessionsError.set(err.message);
        this.revokingId.set(null);
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'medium' });
  }

  sessionMeta(session: ActiveSession): string {
    const m = session.metadata;
    if (!m) return '—';
    const parts: string[] = [];
    if (m['ip']) parts.push(String(m['ip']));
    if (m['userAgent']) parts.push(String(m['userAgent']).slice(0, 60));
    return parts.length ? parts.join(' · ') : '—';
  }

  private showProfileSuccess(msg: string): void {
    this.profileSuccess.set(msg);
    setTimeout(() => this.profileSuccess.set(null), 3000);
  }

  private showPasswordSuccess(msg: string): void {
    this.passwordSuccess.set(msg);
    setTimeout(() => this.passwordSuccess.set(null), 3000);
  }
}
