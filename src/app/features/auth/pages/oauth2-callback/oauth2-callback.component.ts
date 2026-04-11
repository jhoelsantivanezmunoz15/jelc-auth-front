import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div class="text-center">
        @if (error()) {
          <p class="text-red-600 text-sm">{{ error() }}</p>
          <a href="/auth/login" class="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            Volver al inicio de sesión
          </a>
        } @else {
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="mt-3 text-sm text-gray-500">Iniciando sesión...</p>
        }
      </div>
    </div>
  `,
})
export class OAuth2CallbackComponent implements OnInit {
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: TokenService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const expiresAt = params.get('expiresAt');
    const error = params.get('error');

    if (error) {
      this.error.set(decodeURIComponent(error));
      return;
    }

    if (accessToken && refreshToken && expiresAt) {
      this.tokenService.setTokens(accessToken, refreshToken);
      this.authState.setSession(expiresAt);
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      this.error.set('Error al procesar el inicio de sesión social');
    }
  }
}
