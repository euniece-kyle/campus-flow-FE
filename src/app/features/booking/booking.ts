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
  currentUserDisplayName: string = 'Helen Grace Fillalan';
  
  isModalOpen: boolean = false;
  targetRoom: string = '';
  targetPeriod: string = '';

  isViewOpen: boolean = false;
  selectedBooking: any = null;
  showCancelConfirm: boolean = false;

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

  constructor(
    public router: Router, 
    private roomService: RoomService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.selectedDate.setHours(0,0,0,0);
    this.loadBookings();
  }

  getPeriodTime(periodLabel: string): string {
    const period = this.periods.find(p => p.label === periodLabel);
    return period ? period.time : '';
  }

  loadBookings() {
    this.http.get<any[]>('http://localhost:3000/api/bookings').subscribe({
      next: (data) => {
        this.savedBookings = data;
        this.roomService.updateBookings(data);
      },
      error: (err) => console.error('Failed to load bookings from API', err)
    });
  }

  handleNewBooking(bookingData: any) {
    this.loadBookings();
    this.isModalOpen = false;
  }

  confirmCancel() {
    if (!this.selectedBooking || !this.selectedBooking.id) return;
    this.http.delete(`http://localhost:3000/api/bookings/${this.selectedBooking.id}`).subscribe({
      next: () => {
        this.loadBookings();
        this.closeView();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Could not cancel booking. Please check backend connection.');
      }
    });
  }

  get rooms(): string[] {
    const prefix = this.selectedBuilding.split(' ')[0];
    return [prefix + ' 201', prefix + ' 202', prefix + ' 203', prefix + ' 204', prefix + ' 205'];
  }

  getBooking(room: string, periodLabel: string) {
    const formattedDate = this.dateForInput;
    return this.savedBookings.find(b =>
      b.room_name === room &&
      b.period === periodLabel &&
      b.booking_date.startsWith(formattedDate)
    );
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

  onDateChange(event: any) {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      this.selectedDate = new Date(year, month - 1, day);
      this.selectedDate.setHours(0,0,0,0);
    }
  }

  changeDate(offset: number) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + offset);
    d.setHours(0,0,0,0);
    this.selectedDate = d;
  }

  closeView() { this.isViewOpen = false; this.showCancelConfirm = false; this.selectedBooking = null; }
  closeModal() { this.isModalOpen = false; }
  selectBuilding(building: string) { this.selectedBuilding = building; }
  onSignOut() { this.router.navigate(['/login']); }
}