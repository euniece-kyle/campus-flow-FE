import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-modal.html',
  styleUrls: ['./create-modal.scss'],
})
export class CreateModal implements OnInit {
  @Input() roomName: string = '';
  @Input() selectedDate: string = '';
  // FIXED: [error] Added missing Input to fix booking.html Line 68 error
  @Input() period: string = ''; 
  @Input() bookedBy: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  selectedType: 'One-Time' | 'Recurring' = 'One-Time';
  subjects: any[] = [];
  staff: any[] = []; 
  selectedStaff: string = ''; 

  data: any = {
    period: '',
    department: '', 
    untilDate: 'Ending of session',
    showDatePicker: false,
    startDate: '',
    customUntilDate: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // FIXED: [logic] If a period was passed in from the grid, auto-select it
    if (this.period) {
      this.data.period = this.period;
    }

    this.http.get<any[]>('http://localhost:3000/api/subjects').subscribe({
      next: (res) => this.subjects = res,
      error: (err) => console.error('Subject Load Error', err)
    });

    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (res) => {
        this.staff = res;
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const loggedInUser = JSON.parse(savedUser);
          this.selectedStaff = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
        }
      },
      error: (err) => console.error('User Load Error', err)
    });
  }

  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

  onSubmit() {
    const bookingPayload = {
      room_name: this.roomName,
      booking_date: this.selectedDate,
      period: this.data.period,
      subject: this.data.department,
      booked_by: this.selectedStaff,
      booking_type: this.selectedType,
      until_date: this.selectedType === 'Recurring' ? this.data.untilDate : null,
      status: 'Confirmed'
    };

    this.http.post('http://localhost:3000/api/bookings', bookingPayload).subscribe({
      next: (res) => {
        alert('Booking saved successfully!');
        this.close.emit();
        window.location.reload(); 
      },
      error: (err) => {
        console.error('Booking failed', err);
        alert('Failed to save booking.');
      }
    });
  }

  closeModal() { this.close.emit(); }
}