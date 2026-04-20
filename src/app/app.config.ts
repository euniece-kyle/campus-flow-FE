import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// FIXED: Added provideCharts and withDefaultRegisterables to register ng2-charts globally
import { provideCharts, withDefaultRegisterables } from 'ng2-charts'; 
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // FIXED: Registered charts provider here to allow BaseChartDirective to function
    provideCharts(withDefaultRegisterables()) 
  ]
};