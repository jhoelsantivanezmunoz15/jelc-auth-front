import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserService } from '../../services/user.service';
import { RoleService } from '../../../roles/services/role.service';
import { MyBusinessProfilesService } from '../../../my-business-profiles/services/my-business-profiles.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { Role } from '../../../../core/models/role.models';
import { UserBusinessProfile } from '../../../../core/models/user.models';
import { BusinessProfile, BusinessContext } from '../../../my-business-profiles/models/my-business-profiles.models';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEdit = signal(false);
  userId = signal<string | null>(null);
  availableRoles = signal<Role[]>([]);

  // ─── Business profiles state ─────────────────────────────────────────────
  assignedProfiles = signal<UserBusinessProfile[]>([]);
  availableProfiles = signal<BusinessProfile[]>([]);
  availableContexts = signal<BusinessContext[]>([]);
  selectedProfileId = signal<string>('');
  selectedContextId = signal<string>('');
  profilesLoading = signal(false);
  profilesError = signal<string | null>(null);
  profilesSaving = signal(false);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private profilesService: MyBusinessProfilesService,
    private authState: AuthStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roleIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.form.get('password')!.disable();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId.set(id);
      this.form.get('email')!.disable();
      this.loadUser(id);
      if (this.canReadProfiles()) {
        this.loadAssignedProfiles(id);
        this.loadAvailableProfilesAndContexts();
      }
    }
  }

  canReadProfiles(): boolean {
    return this.authState.hasPermission('READ_BUSINESS_PROFILE');
  }

  canAssignProfiles(): boolean {
    return this.authState.hasPermission('ASSIGN_BUSINESS_PROFILE');
  }

  private loadRoles(): void {
    this.roleService.getAll(undefined, 0, 100).subscribe({
      next: res => {
        this.availableRoles.set(
          res.data.content.filter(r => r.active && r.roleType === 'SECURITY')
        );
      },
    });
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: res => {
        this.form.patchValue({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          roleIds: res.data.roles.map(r => r.id),
        });
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  private loadAssignedProfiles(userId: string): void {
    this.profilesLoading.set(true);
    this.userService.getUserBusinessProfiles(userId).subscribe({
      next: res => {
        this.assignedProfiles.set(res.data);
        this.profilesLoading.set(false);
      },
      error: () => this.profilesLoading.set(false),
    });
  }

  private loadAvailableProfilesAndContexts(): void {
    this.profilesService.getProfiles(undefined, 0, 100).subscribe({
      next: res => this.availableProfiles.set(res.data.content.filter(p => p.active)),
    });
    this.profilesService.getContexts(undefined, 0, 100).subscribe({
      next: res => this.availableContexts.set(res.data.content.filter(c => c.active)),
    });
  }

  assignProfile(): void {
    const userId = this.userId();
    const profileId = this.selectedProfileId();
    const contextId = this.selectedContextId();
    if (!userId || !profileId || !contextId) return;

    this.profilesSaving.set(true);
    this.profilesError.set(null);
    this.userService.assignBusinessProfile(userId, profileId, contextId).subscribe({
      next: res => {
        this.assignedProfiles.update(list => [...list, res.data]);
        this.selectedProfileId.set('');
        this.selectedContextId.set('');
        this.profilesSaving.set(false);
      },
      error: (err: BackendError) => {
        this.profilesError.set(err.message);
        this.profilesSaving.set(false);
      },
    });
  }

  removeProfile(item: UserBusinessProfile): void {
    const userId = this.userId();
    if (!userId) return;

    this.userService.removeBusinessProfile(userId, item.businessProfile.id, item.businessContext.id).subscribe({
      next: () => {
        this.assignedProfiles.update(list => list.filter(p => p.id !== item.id));
      },
      error: (err: BackendError) => this.profilesError.set(err.message),
    });
  }

  isRoleSelected(roleId: string): boolean {
    return (this.form.value.roleIds as string[]).includes(roleId);
  }

  toggleRole(roleId: string): void {
    const current: string[] = this.form.value.roleIds ?? [];
    const updated = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];
    this.form.patchValue({ roleIds: updated });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.userService.update(this.userId()!, {
          firstName: this.form.value.firstName,
          lastName: this.form.value.lastName,
          roleIds: this.form.value.roleIds,
        })
      : this.userService.create(this.form.value);

    request$.subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
