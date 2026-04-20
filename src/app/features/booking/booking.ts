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
  bookedRooms: any[] = [];
  selectedBuilding: string = 'SAC Building';
  selectedDate: Date = new Date();
  
  currentUserDisplayName: string = ''; 
  
  isModalOpen: boolean = false;
  targetRoom: string = '';
  targetPeriod: string = '';
  isViewOpen: boolean = false;
  selectedBooking: any = null;
  savedBookings: any[] = [];
  showCancelConfirm: boolean = false;

  // FIXED: [feature] Added state variables to hold data from statsController.ts
  activeBookings: number = 0;
  availableNow: number = 0;
  isListVisible: boolean = false;
  stats = {
    totalSubjects: 0
  };

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
    // FIXED: [issue] Line 42 - Added optional chaining to handle potential null user
    const user = this.roomService.getCurrentUser();
    this.currentUserDisplayName = `${user?.firstName || 'Guest'} ${user?.lastName || ''}`;

      this.roomService.bookings$.subscribe(data => {
      this.savedBookings = data;
      this.bookedRooms = data; 
    });
    this.loadBookings();
    // FIXED: [feature] Load statistics on component initialization
    this.fetchDashboardStats();
  }

  // FIXED: [feature] Fetching data from your existing statsController.ts backend
  fetchDashboardStats() {
    this.http.get('http://localhost:3000/api/stats').subscribe({
      next: (data: any) => {
        this.activeBookings = data.totalBookings || 0;
        this.stats.totalSubjects = data.totalSubjects || 0;
        // Calculation for card display based on your room table
        const totalRooms = data.totalRooms || 20; 
        this.availableNow = totalRooms - this.activeBookings;
      },
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  // FIXED: [feature] Toggle for the "Live Booking Details" list overlay
  toggleBookingList() {
    this.isListVisible = !this.isListVisible;
  }

refreshBookings() {
    this.roomService.loadAllBookings();
  }

  loadBookings() {
    this.roomService.loadAllBookings();
  }

getBooking(room: string, periodLabel: string) {
  const formattedDate = this.dateForInput; // This is YYYY-MM-DD
  return this.savedBookings.find(b => {
    if (!b.booking_date) return false;
    
    // This handles both "2026-04-20T..." and "2026-04-20"
    const dbDate = b.booking_date.includes('T') 
      ? b.booking_date.split('T')[0] 
      : b.booking_date;
      
    return b.room_name === room && b.period === periodLabel && dbDate === formattedDate;
  });
}

getBuildingStyle(roomName: string) {
    const building = roomName.split(' ')[0]; 
    const colors: { [key: string]: string } = {
      'SAC': '#f5a81c', 
      'NAC': '#4a0000', 
      'WAC': '#326284', 
      'EAC': '#E68D76'
    };

    return {
      'background-color': colors[building] || '#e9e9e9',
      'color': 'white',
      'padding': '8px',
      'border-radius': '6px',
      'cursor': 'pointer',
      'font-size': '0.85rem',
      'text-align': 'center'
    };
  }

  onDateChange(event: any) {
    const val = event.target.value;
    if (val) {
      const parts = val.split('-');
      this.selectedDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      this.loadBookings();
    }
  }

  changeDate(days: number) {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    this.selectedDate = newDate;
    this.loadBookings();
  }

  selectBuilding(building: string) {
    this.selectedBuilding = building;
  }

  closeView() {
    this.isViewOpen = false;
    this.selectedBooking = null;
    this.showCancelConfirm = false;
  }

  confirmCancel() {
    if (this.selectedBooking && this.selectedBooking.id) {
      this.http.delete(`http://localhost:3000/api/bookings/${this.selectedBooking.id}`).subscribe({
        next: () => {
          this.closeView();
          this.loadBookings();
          // FIXED: [update] Refresh stats after a cancellation
          this.fetchDashboardStats();
        },
        error: () => console.error('Error cancelling booking.')
      });
    }
  }

  openBookingModal(room: string, periodLabel: string) {
    const existing = this.getBooking(room, periodLabel);
    if (existing) {
      this.selectedBooking = existing;
      this.isViewOpen = true; 
    } else {
      this.targetRoom = room;
      this.targetPeriod = periodLabel;
      this.isModalOpen = true; 
    }
  }

  get rooms(): string[] {
    const prefix = this.selectedBuilding.split(' ')[0];
    return [prefix + ' 201', prefix + ' 202', prefix + ' 203', prefix + ' 204', prefix + ' 205'];
  }

  get dateForInput(): string {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleNewBooking(data: any) { 
    this.loadBookings(); 
    this.isModalOpen = false; 
    // FIXED: [update] Refresh stats after a new booking
    this.fetchDashboardStats();
  }
  
  closeModal() { this.isModalOpen = false; }
  
  onBookingCreated() { 
    this.refreshBookings();
    // FIXED: [update] Refresh stats after a new booking
    this.fetchDashboardStats();
  }

  onSignOut() { 
    // FIXED: [issue] Line 118 - Consistent session clearing
    localStorage.removeItem('currentUser'); 
    localStorage.removeItem('campus_bookings');
    this.router.navigate(['/login']); 
  }
}