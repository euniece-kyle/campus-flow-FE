import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user = {
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

  constructor(public router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.generatePasswordHint();
    } else {
      // Security Check: If someone gets here without logging in, boot them
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

  toggleEdit() {
    if (!this.isEditing) {
      this.userBackup = { ...this.user };
      this.isEditing = true;
    } else {
      // Logic for "DONE" (Saving)
      const first = this.user.firstName.trim().charAt(0) || '';
      const last = this.user.lastName.trim().charAt(0) || '';
      this.user.initials = (first + last).toUpperCase();
      
      this.saveUserData(); // Save to both LocalStorage keys
      this.isEditing = false;
    }
  }

  // --- HELPER: Save to both 'currentUser' AND 'registeredUsers' ---
  saveUserData() {
    // 1. Update Session
    localStorage.setItem('currentUser', JSON.stringify(this.user));

    // 2. Update "Database"
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.email === this.user.email);
    
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...this.user };
      localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
    }
  }

  cancelEdit() {
    if (this.userBackup) {
      this.user = { ...this.userBackup };
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

    // Success: Update and Save
    this.user.password = this.passwordData.new;
    this.saveUserData(); // This keeps the database in sync
    this.generatePasswordHint();
    
    alert('Password updated successfully!');
    this.resetPasswordForm();
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