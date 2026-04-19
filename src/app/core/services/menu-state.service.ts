import { Injectable, effect, signal } from '@angular/core';
import { Observable, of, catchError, map, shareReplay, tap } from 'rxjs';
import { MenuNode } from '../models/menu.models';
import { MenuService } from './menu.service';
import { AuthStateService } from './auth-state.service';

/**
 * Singleton que gestiona el estado del menú de navegación a nivel de aplicación.
 *
 * - El menú se carga UNA SOLA VEZ por sesión desde el backend.
 * - Llamadas posteriores a load() devuelven el caché inmediatamente.
 * - Al cerrar sesión (isAuthenticated → false), el caché se limpia
 *   automáticamente vía effect(), de modo que el próximo login obtiene
 *   el árbol de menús del nuevo usuario.
 * - Tanto el Sidebar como el menuGuard usan este servicio, evitando
 *   múltiples peticiones HTTP para el mismo recurso.
 */
@Injectable({ providedIn: 'root' })
export class MenuStateService {
  private readonly _tree = signal<MenuNode[]>([]);
  private readonly _flatRoutes = signal<Set<string>>(new Set());
  private _loaded = false;
  private _pending$: Observable<MenuNode[]> | null = null;

  readonly tree = this._tree.asReadonly();
  readonly loading = signal(false);
  readonly loadError = signal(false);

  constructor(
    private menuService: MenuService,
    private authState: AuthStateService,
  ) {
    // Limpiar caché al cerrar sesión para que el próximo login re-cargue
    effect(() => {
      if (!authState.isAuthenticated()) {
        this.reset();
      }
    });
  }

  /**
   * Carga el árbol de menús del usuario autenticado.
   * Primera llamada: petición HTTP → guarda en caché.
   * Llamadas siguientes: devuelve caché sin red.
   */
  load(): Observable<MenuNode[]> {
    if (this._loaded) {
      return of(this._tree());
    }

    if (this._pending$) {
      return this._pending$;
    }

    this.loading.set(true);
    this.loadError.set(false);

    this._pending$ = this.menuService.getMenuForCurrentUser().pipe(
      tap(res => {
        const nodes = this.filterEmptyParents(res.data ?? []);
        this._tree.set(nodes);
        this._flatRoutes.set(this.collectRoutes(nodes));
        this._loaded = true;
        this.loading.set(false);
        this._pending$ = null;
      }),
      map(res => res.data ?? []),
      catchError(err => {
        this.loadError.set(true);
        this.loading.set(false);
        this._pending$ = null;
        throw err;
      }),
      shareReplay(1),
    );

    return this._pending$;
  }

  /**
   * Devuelve true si la ruta dada aparece en el árbol de menús del usuario.
   * Mientras el menú no haya sido cargado, devuelve true (optimista) para
   * no bloquear la navegación innecesariamente.
   */
  isRoutePermitted(path: string): boolean {
    if (!this._loaded) return true;
    const routes = this._flatRoutes();
    return routes.has(path) || Array.from(routes).some(r => r.startsWith(path + '/'));
  }

  /** Vacía el caché. Se llama automáticamente al cerrar sesión. */
  reset(): void {
    this._tree.set([]);
    this._flatRoutes.set(new Set());
    this._loaded = false;
    this._pending$ = null;
    this.loading.set(false);
    this.loadError.set(false);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Elimina nodos sin ruta y sin hijos (padres vacíos) de forma recursiva. */
  private filterEmptyParents(nodes: MenuNode[]): MenuNode[] {
    return nodes
      .map(node => ({ ...node, children: this.filterEmptyParents(node.children ?? []) }))
      .filter(node => node.route !== null || node.children.length > 0);
  }

  /** Recorre el árbol recursivamente y recopila todos los valores de `route`. */
  private collectRoutes(nodes: MenuNode[]): Set<string> {
    const routes = new Set<string>();
    const visit = (list: MenuNode[]) => {
      for (const node of list) {
        if (node.route) routes.add(node.route);
        if (node.children?.length) visit(node.children);
      }
    };
    visit(nodes);
    return routes;
  }
}
