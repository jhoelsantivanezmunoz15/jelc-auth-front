import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { AdminService } from '../../services/admin.service';
import { CreateFeatureFlagRequest, FeatureFlag } from '../../models/admin.models';

@Component({
  selector: 'app-feature-flags',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './feature-flags.component.html',
})
export class FeatureFlagsComponent implements OnInit {
  flags = signal<FeatureFlag[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  showForm = signal(false);
  saving = signal(false);

  form: CreateFeatureFlagRequest = { key: '', name: '', description: '', enabled: false };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getFlags().subscribe({
      next: res => {
        this.flags.set(res.data);
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  toggle(flag: FeatureFlag): void {
    this.adminService.toggleFlag(flag.id, !flag.enabled).subscribe({
      next: res => {
        this.flags.update(list =>
          list.map(f => (f.id === flag.id ? res.data : f))
        );
        this.showSuccess(`Flag "${flag.key}" ${!flag.enabled ? 'activado' : 'desactivado'}`);
      },
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  openForm(): void {
    this.form = { key: '', name: '', description: '', enabled: false };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submit(): void {
    if (!this.form.key || !this.form.name) return;
    this.saving.set(true);
    this.adminService.createFlag(this.form).subscribe({
      next: res => {
        this.flags.update(list => [...list, res.data]);
        this.showSuccess(`Flag "${res.data.key}" creado`);
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.saving.set(false);
      },
    });
  }

  delete(flag: FeatureFlag): void {
    if (!confirm(`¿Eliminar el flag "${flag.key}"?`)) return;
    this.adminService.deleteFlag(flag.id).subscribe({
      next: () => {
        this.flags.update(list => list.filter(f => f.id !== flag.id));
        this.showSuccess(`Flag "${flag.key}" eliminado`);
      },
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  private showSuccess(msg: string): void {
    this.success.set(msg);
    setTimeout(() => this.success.set(null), 3000);
  }
}
