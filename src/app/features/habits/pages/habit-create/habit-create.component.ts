import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Habit } from '../../../../core/models/habit.models';
import { HabitService } from '../../services/habit.service';
import { BackendError } from '../../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-habit-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './habit-create.component.html',
})
export class HabitCreateComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  created = signal<Habit | null>(null);

  constructor(private fb: FormBuilder, private habitService: HabitService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.habitService.create(this.form.value).subscribe({
      next: res => {
        this.created.set(res.habit);
        this.form.reset();
        this.loading.set(false);
      },
      error: (err: BackendError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
