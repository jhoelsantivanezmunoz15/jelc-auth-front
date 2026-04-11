import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuStateService } from '../../core/services/menu-state.service';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MenuItemComponent, RouterLink],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor(public menuState: MenuStateService) {}

  ngOnInit(): void {
    // Si el menuGuard ya disparó load() antes de que se renderice el sidebar,
    // esta llamada devuelve el caché al instante y no genera una segunda petición.
    this.menuState.load().subscribe();
  }
}
