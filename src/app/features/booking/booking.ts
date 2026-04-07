import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateModal } from './create-modal/create-modal'; 

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateModal],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss'],
  providers: [DatePipe]
})
export class BookingComponent {
  // --- UI STATE ---
  selectedBuilding: string = 'WAC Building';
  selectedDate: Date = new Date(2026, 0, 27); 
  
  isModalOpen: boolean = false; 
  targetRoom: string = '';
  targetPeriod: string = ''; // Tracks which column was clicked

  // --- DATA STORAGE ---
  // This "memory" stores bookings so they stay on the grid
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

  get rooms(): string[] {
    const prefix = this.selectedBuilding.split(' ')[0];
    return [prefix + ' 201', prefix + ' 202', prefix + ' 203', prefix + ' 204', prefix + ' 205'];
  }

  // --- MODAL & BOOKING METHODS ---

  /**
   * Opens the modal. Updated to accept period label for precise booking.
   */
  openBookingModal(room: string, periodLabel: string) {
    this.targetRoom = room;
    this.targetPeriod = periodLabel; 
    this.isModalOpen = true;
  }

  /**
   * FIXES TS2339: This catches the data sent from the modal's (create) emitter.
   */
  handleNewBooking(bookingData: any) {
    this.savedBookings.push({
      ...bookingData,
      // Ensures the booking only shows on the date it was created
      dateKey: this.selectedDate.toDateString() 
    });
    this.isModalOpen = false;
  }

  /**
   * Checks if a specific cell has a booking. Used by [ngClass] in HTML.
   */
  getBooking(room: string, periodLabel: string) {
    return this.savedBookings.find(b => 
      b.room === room && 
      b.period === periodLabel && 
      b.dateKey === this.selectedDate.toDateString()
    );
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // --- NAVIGATION & DATE METHODS ---

  selectBuilding(building: string) {
    this.selectedBuilding = building;
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
    }
  }

  changeDate(offset: number) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + offset);
    this.selectedDate = d;
  }
}