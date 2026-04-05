import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  // 1. Inject the router
  constructor(private router: Router) {}

  // 2. Function to navigate back to login
  onCreateAccount() {
    console.log('Account created! Navigating to login...');
    this.router.navigate(['/login']);
  }
}