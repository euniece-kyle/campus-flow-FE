import { Component, OnInit } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { CreateModal } from './create-modal/create-modal';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateModal, RouterModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss'],
  providers: [DatePipe]
})
export class BookingComponent implements OnInit { 
  // FIXED: [logic] Unifying stats object to fix Dashboard cards in booking.html
  stats = {
    totalBookings: 0,
    availableNow: 0,
    totalSubjects: 0
  };

  // FIXED: [error] Matches binding on booking.html line 68
  targetPeriod: string = '';
  targetRoom: string = '';
  
  currentUserDisplayName: string = ''; 
  isModalOpen: boolean = false;
  isListVisible: boolean = false;
  isViewOpen: boolean = false;
  selectedBooking: any = null;
  savedBookings: any[] = [];
  bookedRooms: any[] = [];
  showCancelConfirm: boolean = false;
  selectedDate: Date = new Date();
  selectedBuilding: string = 'SAC Building';

  // Standalone for legacy
  activeBookings: number = 0;
  availableNow: number = 0;

  buildings: string[] = ['SAC Building', 'NAC Building', 'WAC Building', 'EAC Building'];
  periods = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH',    time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  constructor(public router: Router, private roomService: RoomService, private http: HttpClient) {}

  ngOnInit() {
    const user = this.roomService.getCurrentUser();
    this.currentUserDisplayName = `${user?.firstName || 'Guest'} ${user?.lastName || ''}`;

    this.roomService.bookings$.subscribe(data => {
      this.savedBookings = data;
      this.bookedRooms = data; 
    });
    
    this.loadBookings();
    this.fetchDashboardStats();
  }

  fetchDashboardStats() {
    this.http.get('http://localhost:3000/api/stats').subscribe({
      next: (data: any) => {
        this.stats.totalBookings = data.totalBookings || 0;
        this.stats.totalSubjects = data.totalSubjects || 0;
        this.stats.availableNow = data.availableNow || 0;
        
        this.activeBookings = this.stats.totalBookings;
        this.availableNow = this.stats.availableNow;
      },
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  toggleBookingList() { this.isListVisible = !this.isListVisible; }
  loadBookings() { this.roomService.loadAllBookings(); }
  refreshBookings() { this.roomService.loadAllBookings(); }

  get dateForInput(): string {
    return this.selectedDate.toISOString().split('T')[0];
  }

  openBookingModal(room: string, periodLabel: string) {
    this.targetRoom = room;
    this.targetPeriod = periodLabel; 
    this.isModalOpen = true; 
  }

  closeModal() { this.isModalOpen = false; }
  onBookingCreated() { 
    this.refreshBookings();
    this.fetchDashboardStats();
  }

  onSignOut() { 
    localStorage.clear();
    this.router.navigate(['/login']); 
  }
}