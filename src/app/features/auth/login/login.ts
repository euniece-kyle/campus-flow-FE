import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <--- Add this import

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink], // <--- Add it here! This makes the [routerLink] in HTML work.
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {}