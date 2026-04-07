import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { RegisterComponent } from './features/auth/register/register';
import { BookingComponent } from './features/booking/booking'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'booking', component: BookingComponent },
  
  // Default route (root) redirects to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Wildcard route: catch any undefined URL and redirect to login
  { path: '**', redirectTo: 'login' }
];