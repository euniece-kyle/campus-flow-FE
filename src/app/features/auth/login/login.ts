import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // 1. Added RouterLink here
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  // 2. Add RouterLink to this array
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {}

  // This handles the "LOG IN" button
  onLogin() {
    if (this.email.trim() && this.password.trim()) {
      this.router.navigate(['/booking']);
    }
  }
}