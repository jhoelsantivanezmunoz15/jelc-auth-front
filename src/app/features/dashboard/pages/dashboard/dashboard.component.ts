import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(public authState: AuthStateService) {}
}
