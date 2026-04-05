import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { RegisterComponent } from './features/auth/register/register';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];