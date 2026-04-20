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
  selectedBuilding: string = 'SAC Building';
  selectedDate: Date = new Date();
  
  // FIXED: Declared correctly for Line 152 in HTML
  currentUserDisplayName: string = ''; 
  
  isModalOpen: boolean = false;
  targetRoom: string = '';
  targetPeriod: string = '';
  isViewOpen: boolean = false;
  selectedBooking: any = null;
  savedBookings: any[] = [];
  showCancelConfirm: boolean = false;

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
    // FIXED: Correctly fetching the user display name for modal binding
    const user = this.roomService.getCurrentUser();
    this.currentUserDisplayName = `${user?.firstName || 'Guest'} ${user?.lastName || ''}`;

    this.roomService.bookings$.subscribe(data => {
      this.savedBookings = data;
    });
    this.loadBookings();
  }

  loadBookings() {
    this.roomService.loadAllBookings();
  }

  // FIXED: Standardized date comparison to prevent timezone shifts (April 20 stays April 20)
  getBooking(room: string, periodLabel: string) {
    const formattedDate = this.dateForInput; 
    return this.savedBookings.find(b => {
      if (!b.booking_date) return false;
      
      // FIXED: Use split('T') to extract the YYYY-MM-DD part only, ignoring the timestamp
      const dbDate = b.booking_date.includes('T') ? b.booking_date.split('T')[0] : b.booking_date;
      
      return b.room_name === room && b.period === periodLabel && dbDate === formattedDate;
    });
  }

  onDateChange(event: any) {
    const val = event.target.value;
    if (val) {
      const parts = val.split('-');
      this.selectedDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      this.loadBookings();
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

  get dateForInput(): string {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get rooms(): string[] {
    const prefix = this.selectedBuilding.split(' ')[0];
    return [prefix + ' 201', prefix + ' 202', prefix + ' 203', prefix + ' 204', prefix + ' 205'];
  }

  handleNewBooking(data: any) { this.loadBookings(); this.isModalOpen = false; }
  closeModal() { this.isModalOpen = false; }
  selectBuilding(b: string) { this.selectedBuilding = b; }
  changeDate(n: number) { 
    this.selectedDate.setDate(this.selectedDate.getDate() + n); 
    this.loadBookings(); 
  }
}