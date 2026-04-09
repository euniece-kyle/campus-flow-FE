import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  // Bindings for [(ngModel)] in login.html
  email = '';
  password = '';

  // Password Visibility State
  showPassword = false;

  constructor(private router: Router) {}

  onLogin() {
    // 1. Validate empty inputs
    if (!this.email.trim() || !this.password.trim()) {
      alert('Please enter your email and password.');
      return;
    }

    // 2. Fetch all registered accounts from LocalStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // 3. Search for a matching account
    // We check against 'email' because that's what we saved during registration
    const foundUser = registeredUsers.find((u: any) => 
      u.email === this.email && u.password === this.password
    );

    if (foundUser) {
      // 4. Set the active session
      // This saves the object with {firstName, lastName, email, initials, password}
      localStorage.setItem('currentUser', JSON.stringify(foundUser));

      console.log(`Login successful for: ${foundUser.firstName} ${foundUser.lastName}`);
      
      // 5. Navigate to the main app
      this.router.navigate(['/booking']);
    } else {
      // 6. Handle failure
      alert('Invalid email or password. Please check your credentials or register a new account.');
    }
  }
}