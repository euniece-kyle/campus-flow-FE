import { Component, OnInit } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { CreateModal } from './create-modal/create-modal';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateModal, RouterModule],
  templateUrl: './booking.html', // Fixed: Points to booking.html
  styleUrls: ['./booking.scss'],
  providers: [DatePipe]
})
export class BookingComponent implements OnInit { 
  selectedBuilding: string = 'SAC Building';
  selectedDate: Date = new Date();
  
  isModalOpen: boolean = false;
  targetRoom: string = '';
  targetPeriod: string = '';
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

  constructor(public router: Router, private roomService: RoomService) {}

  ngOnInit() {
    this.selectedDate.setHours(0,0,0,0);
    const saved = localStorage.getItem('campus_bookings');
    if (saved) {
      this.savedBookings = JSON.parse(saved);
    }
  }

  get rooms(): string[] {
    const prefix = this.selectedBuilding.split(' ')[0];
    return [prefix + ' 201', prefix + ' 202', prefix + ' 203', prefix + ' 204', prefix + ' 205'];
  }

  get dateForInput(): string {
    return this.selectedDate.toISOString().split('T')[0];
  }

  onDateChange(event: any) {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.selectedDate = new Date(val);
    }
  }

  changeDate(offset: number) {
    this.selectedDate.setDate(this.selectedDate.getDate() + offset);
    this.selectedDate = new Date(this.selectedDate);
  }

  selectBuilding(building: string) {
    this.selectedBuilding = building;
  }

  getBooking(room: string, periodLabel: string) {
    return this.savedBookings.find(b =>
      b.room === room &&
      b.period === periodLabel &&
      b.dateKey === this.selectedDate.toDateString()
    );
  }

  openBookingModal(room: string, periodLabel: string) {
    this.targetRoom = room;
    this.targetPeriod = periodLabel;
    this.isModalOpen = true;
  }

  handleNewBooking(bookingData: any) {
    const newBooking = {
      ...bookingData,
      room: this.targetRoom,
      period: this.targetPeriod,
      dateKey: this.selectedDate.toDateString()
    };
    this.savedBookings.push(newBooking);
    localStorage.setItem('campus_bookings', JSON.stringify(this.savedBookings));
    this.roomService.updateBookings(this.savedBookings);
    this.isModalOpen = false;
  }

  closeModal() { this.isModalOpen = false; }
}