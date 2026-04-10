import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  buildings: string[] = ['SAC', 'NAC', 'WAC', 'EAC'];
  roomsPerBuilding: number = 5;
  periodsPerDay: number = 6; 

  totalRooms: number = 20; 
  activeBookings: number = 0; 
  availableNow: number = 20; // Set default to 20 so it's accurate on load
  dailyTotal: number = 0;     

  // --- INTERACTIVITY STATE ---
  todaysBookings: any[] = [];    
  isListVisible: boolean = false; 

  private roomService = inject(RoomService);

  constructor(public router: Router) {}

  ngOnInit(): void {
    // Ensure totalRooms is calculated immediately
    this.totalRooms = this.buildings.length * this.roomsPerBuilding;
    
    // Subscribe to the service. This runs every time a booking is added/removed.
    this.roomService.bookings$.subscribe((allBookings: any[]) => {
      this.calculateLiveStats(allBookings);
    });
  }

  calculateLiveStats(allBookings: any[]): void {
    const todayStr = new Date().toDateString();
    
    // 1. Update Daily Sessions (Total count in system)
    this.dailyTotal = allBookings.length;
    
    // 2. Filter strictly for today's objects to get "Active" count
    this.todaysBookings = allBookings.filter(b => b.dateKey === todayStr);
    
    // 3. Update activeBookings based on today's list
    this.activeBookings = this.todaysBookings.length;
    
    // 4. ACCURATE TRACKING: Available = Total - Active
    // If activeBookings is 1, availableNow becomes 19.
    this.availableNow = this.totalRooms - this.activeBookings;
  }

  // --- INTERACTION METHODS ---

  toggleBookingList(): void {
    this.isListVisible = !this.isListVisible;
  }

  clearAllBookings(): void {
    if(confirm('Are you sure you want to clear all data?')) {
      localStorage.removeItem('campus_bookings');
      this.roomService.updateBookings([]);
      this.isListVisible = false; // Hide panel on clear
    }
  }

  onSignOut(): void {
    this.router.navigate(['/login']);
  }
}