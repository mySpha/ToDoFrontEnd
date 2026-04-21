import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptor/loading-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';


export const appConfig: ApplicationConfig = {
  providers: [
              provideBrowserGlobalErrorListeners(),
              provideRouter(routes),
              provideHttpClient(),
              provideHttpClient(withInterceptors([loadingInterceptor])),
              provideAnimations()
            ],
};
