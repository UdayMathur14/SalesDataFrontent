import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthSessionService } from './auth-session.service';
import { authTokenInterceptor } from './auth-token.interceptor';
import { httpLoadingInterceptor } from './http-loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor, httpLoadingInterceptor])),
    provideAppInitializer(() => inject(AuthSessionService).initialize()),
    provideRouter(routes),
  ],
};
