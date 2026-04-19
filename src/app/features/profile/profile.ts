import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Added back to fix errors

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule], // Added HttpClientModule
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: any = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    initials: ''
  };

  maskedPasswordHint: string = '';
  userBackup: any;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;

  passwordData = { current: '', new: '', confirm: '' };
  showPassword = { current: false, new: false, confirm: false };

  // This matches your backend apiUrl
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(public router: Router, private http: HttpClient) {} // Injected HttpClient

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.generatePasswordHint();
      this.updateInitials();
    } else {
      this.router.navigate(['/login']);
    }
  }

  generatePasswordHint() {
    const pass = this.user.password || '';
    if (pass.length > 2) {
      const first = pass.charAt(0);
      const last = pass.charAt(pass.length - 1);
      const middle = '*'.repeat(pass.length - 2);
      this.maskedPasswordHint = `${first}${middle}${last}`;
    } else {
      this.maskedPasswordHint = '********';
    }
  }

  updateInitials() {
    const first = this.user.firstName?.trim().charAt(0) || '';
    const last = this.user.lastName?.trim().charAt(0) || '';
    this.user.initials = (first + last).toUpperCase();
  }

  toggleEdit() {
    if (!this.isEditing) {
      // Create a deep copy so we can cancel changes
      this.userBackup = JSON.parse(JSON.stringify(this.user));
      this.isEditing = true;
    }
  }

saveUserData() {
    this.updateInitials();
    
    // THE FIX: Added (any) to updatedUser to solve the TS2696 error in your terminal
    this.http.patch(`${this.apiUrl}/${this.user.id}`, this.user).subscribe({
      next: (updatedUser: any) => {
        this.user = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.isEditing = false;
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        // Fallback: update local storage anyway so the UI stays in sync
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.isEditing = false;
        alert('Profile updated locally!');
      }
    });
  }

  cancelEdit() {
    if (this.userBackup) {
      // Restore from backup
      this.user = JSON.parse(JSON.stringify(this.userBackup));
    }
    this.isEditing = false;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    this.showPassword[field] = !this.showPassword[field];
  }

  updatePassword() {
    if (!this.passwordData.current || !this.passwordData.new || !this.passwordData.confirm) {
      alert('Please fill in all password fields.');
      return;
    }

    if (this.passwordData.current !== this.user.password) {
      alert('Current password is incorrect.');
      return;
    }

    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }

    if (this.passwordData.new.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

// Prepare password update payload
    const payload = { password: this.passwordData.new };
    
    this.http.patch(`${this.apiUrl}/${this.user.id}/password`, payload).subscribe({
      next: () => {
        this.user.password = this.passwordData.new;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.generatePasswordHint();
        alert('Password updated successfully!');
        this.resetPasswordForm();
      },
      error: () => alert('Failed to update password on the server.')
    });
  }

  resetPasswordForm() {
    this.isChangingPassword = false;
    this.passwordData = { current: '', new: '', confirm: '' };
    this.showPassword = { current: false, new: false, confirm: false };
  }

  onSignOut() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}