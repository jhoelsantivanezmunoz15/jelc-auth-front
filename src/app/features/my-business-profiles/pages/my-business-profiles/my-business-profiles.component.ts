import { Component, OnInit, signal } from '@angular/core';

import { AuthStateService } from '../../../../core/services/auth-state.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import {
  BusinessProfile,
  BusinessContext,
  BusinessProfileForm,
  BusinessContextForm,
} from '../../models/my-business-profiles.models';
import { MyBusinessProfilesService } from '../../services/my-business-profiles.service';

type Tab = 'profiles' | 'contexts';

@Component({
  selector: 'app-my-business-profiles',
  standalone: true,
  imports: [],
  templateUrl: './my-business-profiles.component.html',
})
export class MyBusinessProfilesComponent implements OnInit {
  activeTab = signal<Tab>('profiles');

  // ─── Profiles state ──────────────────────────────────────────────────────
  profiles = signal<BusinessProfile[]>([]);
  profilesLoading = signal(false);
  profilesError = signal<string | null>(null);
  profileSearch = signal('');
  profilePage = signal(0);
  profileTotalPages = signal(0);
  profileTotalElements = signal(0);

  profileModal = signal(false);
  profileEditing = signal<BusinessProfile | null>(null);
  profileForm: BusinessProfileForm = { name: '', description: '' };
  profileSaving = signal(false);
  profileFormError = signal<string | null>(null);

  // ─── Contexts state ───────────────────────────────────────────────────────
  contexts = signal<BusinessContext[]>([]);
  contextsLoading = signal(false);
  contextsError = signal<string | null>(null);
  contextSearch = signal('');
  contextPage = signal(0);
  contextTotalPages = signal(0);
  contextTotalElements = signal(0);

  contextModal = signal(false);
  contextEditing = signal<BusinessContext | null>(null);
  contextForm: BusinessContextForm = { name: '', description: '' };
  contextSaving = signal(false);
  contextFormError = signal<string | null>(null);

  constructor(
    public authState: AuthStateService,
    private service: MyBusinessProfilesService
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
    this.loadContexts();
  }

  // ─── Tab ──────────────────────────────────────────────────────────────────
  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  // ─── Profiles CRUD ───────────────────────────────────────────────────────
  loadProfiles(): void {
    this.profilesLoading.set(true);
    this.profilesError.set(null);
    this.service.getProfiles(this.profileSearch() || undefined, this.profilePage()).subscribe({
      next: res => {
        this.profiles.set(res.data.content);
        this.profileTotalPages.set(res.data.totalPages);
        this.profileTotalElements.set(res.data.totalElements);
        this.profilesLoading.set(false);
      },
      error: (err: BackendError) => {
        this.profilesError.set(err.message);
        this.profilesLoading.set(false);
      },
    });
  }

  profileGoToPage(p: number): void {
    if (p < 0 || p >= this.profileTotalPages()) return;
    this.profilePage.set(p);
    this.loadProfiles();
  }

  openCreateProfile(): void {
    this.profileEditing.set(null);
    this.profileForm = { name: '', description: '' };
    this.profileFormError.set(null);
    this.profileModal.set(true);
  }

  openEditProfile(p: BusinessProfile): void {
    this.profileEditing.set(p);
    this.profileForm = { name: p.name, description: p.description ?? '' };
    this.profileFormError.set(null);
    this.profileModal.set(true);
  }

  closeProfileModal(): void {
    this.profileModal.set(false);
  }

  saveProfile(): void {
    if (!this.profileForm.name.trim()) {
      this.profileFormError.set('El nombre es obligatorio');
      return;
    }
    this.profileSaving.set(true);
    this.profileFormError.set(null);
    const editing = this.profileEditing();
    const req$ = editing
      ? this.service.updateProfile(editing.id, this.profileForm)
      : this.service.createProfile(this.profileForm);

    req$.subscribe({
      next: () => {
        this.profileModal.set(false);
        this.profileSaving.set(false);
        this.profilePage.set(0);
        this.loadProfiles();
      },
      error: (err: BackendError) => {
        this.profileFormError.set(err.message);
        this.profileSaving.set(false);
      },
    });
  }

  deleteProfile(id: string): void {
    if (!confirm('¿Confirmas que deseas eliminar este perfil?')) return;
    this.service.deleteProfile(id).subscribe({
      next: () => this.loadProfiles(),
      error: (err: BackendError) => this.profilesError.set(err.message),
    });
  }

  profilePages(): number[] {
    return Array.from({ length: this.profileTotalPages() }, (_, i) => i);
  }

  // ─── Contexts CRUD ───────────────────────────────────────────────────────
  loadContexts(): void {
    this.contextsLoading.set(true);
    this.contextsError.set(null);
    this.service.getContexts(this.contextSearch() || undefined, this.contextPage()).subscribe({
      next: res => {
        this.contexts.set(res.data.content);
        this.contextTotalPages.set(res.data.totalPages);
        this.contextTotalElements.set(res.data.totalElements);
        this.contextsLoading.set(false);
      },
      error: (err: BackendError) => {
        this.contextsError.set(err.message);
        this.contextsLoading.set(false);
      },
    });
  }

  contextGoToPage(p: number): void {
    if (p < 0 || p >= this.contextTotalPages()) return;
    this.contextPage.set(p);
    this.loadContexts();
  }

  openCreateContext(): void {
    this.contextEditing.set(null);
    this.contextForm = { name: '', description: '' };
    this.contextFormError.set(null);
    this.contextModal.set(true);
  }

  openEditContext(c: BusinessContext): void {
    this.contextEditing.set(c);
    this.contextForm = { name: c.name, description: c.description ?? '' };
    this.contextFormError.set(null);
    this.contextModal.set(true);
  }

  closeContextModal(): void {
    this.contextModal.set(false);
  }

  saveContext(): void {
    if (!this.contextForm.name.trim()) {
      this.contextFormError.set('El nombre es obligatorio');
      return;
    }
    this.contextSaving.set(true);
    this.contextFormError.set(null);
    const editing = this.contextEditing();
    const req$ = editing
      ? this.service.updateContext(editing.id, this.contextForm)
      : this.service.createContext(this.contextForm);

    req$.subscribe({
      next: () => {
        this.contextModal.set(false);
        this.contextSaving.set(false);
        this.contextPage.set(0);
        this.loadContexts();
      },
      error: (err: BackendError) => {
        this.contextFormError.set(err.message);
        this.contextSaving.set(false);
      },
    });
  }

  deleteContext(id: string): void {
    if (!confirm('¿Confirmas que deseas eliminar este contexto?')) return;
    this.service.deleteContext(id).subscribe({
      next: () => this.loadContexts(),
      error: (err: BackendError) => this.contextsError.set(err.message),
    });
  }

  contextPages(): number[] {
    return Array.from({ length: this.contextTotalPages() }, (_, i) => i);
  }
}
