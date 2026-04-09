import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Added CommonModule and FormsModule
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  // Input bindings
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Logic states
  step: number = 1; // Step 1: Find Email, Step 2: New Password

  constructor(private router: Router) {}

  // STEP 1: Check if the email is actually registered
  onVerifyEmail() {
    if (!this.email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = allUsers.find((u: any) => u.email === this.email);

    if (userExists) {
      this.step = 2; // Move to the "New Password" screen
    } else {
      alert('This email is not registered with CampusFlow.');
    }
  }

  // STEP 2: Update the password in the "database"
  onResetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    // Update 'registeredUsers' array
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.email === this.email);

    if (userIndex !== -1) {
      // Update the password for this user
      allUsers[userIndex].password = this.newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(allUsers));

      alert('Password updated successfully! You can now log in.');
      this.router.navigate(['/login']);
    } else {
      alert('An error occurred. Please try again.');
      this.step = 1;
    }
  }

  // For the "Back" or "Done" buttons
  onCancel() {
    this.router.navigate(['/login']);
  }
}