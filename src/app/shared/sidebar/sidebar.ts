import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 1. Add RouterModule here

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule // 2. Add RouterModule to this array
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  constructor(private router: Router) {}

  onSignOut(): void {
    console.log('Sign out clicked'); // 3. Add this to verify the click works
    this.router.navigate(['/login']).then(success => {
      if (success) {
        console.log('Navigation successful!');
      } else {
        console.error('Navigation failed!');
      }
    });
  }
}