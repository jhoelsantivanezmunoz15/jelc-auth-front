import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthStateService } from './core/services/auth-state.service';
import { FeatureFlagStateService } from './core/services/feature-flag-state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (authState: AuthStateService) => () => authState.initSession(),
      deps: [AuthStateService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (ffService: FeatureFlagStateService) => () => ffService.load(),
      deps: [FeatureFlagStateService],
      multi: true,
    },
  ],
};
