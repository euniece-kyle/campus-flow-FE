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
  currentUserDisplayName: string = 'Precious Fillalan'; 
  
  isModalOpen: boolean = false;
  targetRoom: string = '';
  targetPeriod: string = '';

  isViewOpen: boolean = false;
  selectedBooking: any = null;
  savedBookings: any[] = [];
  
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
    this.selectedDate.setHours(0,0,0,0);
    // FIXED: Real-time sync - subscribe to RoomService changes
    this.roomService.bookings$.subscribe(data => {
      this.savedBookings = data;
    });
    this.loadBookings();
  }

  loadBookings() {
    this.roomService.loadAllBookings();
  }

  // FIXED: Date reconciliation - split ISO string ('T') to match local YYYY-MM-DD
  getBooking(room: string, periodLabel: string) {
    const formattedDate = this.dateForInput; 
    return this.savedBookings.find(b => {
      const dbDate = b.booking_date ? b.booking_date.split('T')[0] : '';
      return b.room_name === room &&
             b.period === periodLabel &&
             dbDate === formattedDate;
    });
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

  handleNewBooking(bookingData: any) { this.loadBookings(); this.isModalOpen = false; }
  closeModal() { this.isModalOpen = false; }
  onSignOut() { this.router.navigate(['/login']); }
}