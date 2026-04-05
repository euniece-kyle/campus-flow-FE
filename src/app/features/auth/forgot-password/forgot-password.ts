import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  constructor(private router: Router) {}

  onDone() {
    // Sends user back to the login page
    this.router.navigate(['/login']);
  }
}