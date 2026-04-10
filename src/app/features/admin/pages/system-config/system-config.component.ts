import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendError } from '../../../../core/interceptors/error.interceptor';
import { AdminService } from '../../services/admin.service';
import { ConfigCategory, ConfigType, CreateSystemConfigRequest, SystemConfig } from '../../models/admin.models';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './system-config.component.html',
})
export class SystemConfigComponent implements OnInit {
  configs = signal<SystemConfig[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  showCreateForm = signal(false);
  saving = signal(false);

  editingId: string | null = null;
  editingValue = '';

  selectedCategory = signal<ConfigCategory | ''>('');

  createForm: CreateSystemConfigRequest = {
    key: '',
    value: '',
    type: 'STRING',
    category: 'GENERAL',
    description: '',
    editable: true,
  };

  readonly types: ConfigType[] = ['STRING', 'INTEGER', 'BOOLEAN', 'JSON'];
  readonly categories: ConfigCategory[] = ['AUTH', 'SECURITY', 'TIMEOUT', 'POLICY', 'GENERAL'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const cat = this.selectedCategory() || undefined;
    this.adminService.getConfigs(cat as ConfigCategory | undefined).subscribe({
      next: res => {
        this.configs.set(res.data);
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  filterByCategory(category: ConfigCategory | ''): void {
    this.selectedCategory.set(category);
    this.load();
  }

  startEdit(config: SystemConfig): void {
    this.editingId = config.id;
    this.editingValue = config.value;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingValue = '';
  }

  saveEdit(config: SystemConfig): void {
    this.adminService.updateConfig(config.id, this.editingValue).subscribe({
      next: res => {
        this.configs.update(list => list.map(c => (c.id === config.id ? res.data : c)));
        this.editingId = null;
        this.showSuccess(`Config "${config.key}" actualizada`);
      },
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  openCreateForm(): void {
    this.createForm = { key: '', value: '', type: 'STRING', category: 'GENERAL', description: '', editable: true };
    this.showCreateForm.set(true);
  }

  closeCreateForm(): void {
    this.showCreateForm.set(false);
  }

  submit(): void {
    if (!this.createForm.key || !this.createForm.value) return;
    this.saving.set(true);
    this.adminService.createConfig(this.createForm).subscribe({
      next: res => {
        this.configs.update(list => [...list, res.data]);
        this.showSuccess(`Config "${res.data.key}" creada`);
        this.showCreateForm.set(false);
        this.saving.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.saving.set(false);
      },
    });
  }

  delete(config: SystemConfig): void {
    if (!confirm(`¿Eliminar la configuración "${config.key}"?`)) return;
    this.adminService.deleteConfig(config.id).subscribe({
      next: () => {
        this.configs.update(list => list.filter(c => c.id !== config.id));
        this.showSuccess(`Config "${config.key}" eliminada`);
      },
      error: (err: BackendError) => this.error.set(err.message),
    });
  }

  private showSuccess(msg: string): void {
    this.success.set(msg);
    setTimeout(() => this.success.set(null), 3000);
  }
}
