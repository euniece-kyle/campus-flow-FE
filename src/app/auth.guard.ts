import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * This guard prevents unauthorized users from accessing 
 * internal pages like /profile, /booking, or /department.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 1. Check if 'currentUser' exists in LocalStorage
  const userSession = localStorage.getItem('currentUser');

  if (userSession) {
    // 2. Account found! Allow the user to enter the website.
    return true;
  } else {
    // 3. No account saved! Redirect to login and block the page.
    console.warn('Unauthorized access blocked. Redirecting to Login...');
    router.navigate(['/login']);
    return false;
  }
};