import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  // Bind these to your register.html inputs using [(ngModel)]
  userData = {
    username: '', // This is the "Full Name" input
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  onCreateAccount() {
    // 1. Basic Validation
    if (!this.userData.username.trim() || !this.userData.password || !this.userData.email) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // 2. THE FIX: Split Full Name into First and Last Name
    const fullName = this.userData.username.trim();
    const nameParts = fullName.split(/\s+/); // Splits by any whitespace
    
    const firstName = nameParts[0];
    // If there's more than one word, join the rest as the last name. 
    // Otherwise, default to an empty string.
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Generate initials (e.g., "EK")
    const initials = (firstName[0] + (lastName ? lastName[0] : '')).toUpperCase();

    // 3. Create the complete user object
    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: this.userData.email,
      password: this.userData.password, // Saved for login check
      initials: initials
    };

    // 4. Update the "Registered Users" list in LocalStorage
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if email is already taken
    const emailExists = existingUsers.some((u: any) => u.email === this.userData.email);
    if (emailExists) {
      alert('An account with this email already exists!');
      return;
    }

    // 5. Save to "Database"
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    console.log('Account created for:', firstName, lastName);
    alert('Account created successfully! You can now log in.');

    // 6. Navigate to login
    this.router.navigate(['/login']);
  }
}