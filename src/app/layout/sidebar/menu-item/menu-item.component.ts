import { Component, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuNode } from '../../../core/models/menu.models';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  // Self-import enables recursive template rendering for nested children
  imports: [RouterLink, RouterLinkActive, MenuItemComponent],
  templateUrl: './menu-item.component.html',
})
export class MenuItemComponent {
  @Input({ required: true }) item!: MenuNode;
  @Input() depth = 0;

  expanded = signal(false);

  get hasChildren(): boolean {
    return Array.isArray(this.item.children) && this.item.children.length > 0;
  }

  get isLeaf(): boolean {
    return !this.hasChildren && !!this.item.route;
  }

  toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
