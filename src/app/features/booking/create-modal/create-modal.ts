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
    untilDate: '', // Changed from string to empty for date selection
    showDatePicker: false,
    startDate: '',
    customUntilDate: ''
  };

  periods = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH',    time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  constructor(private http: HttpClient) {}

ngOnInit() {
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
      } else {
        this.selectedStaff = "Precious Fillalan";
      }
    },
    error: (err) => console.error('User Load Error', err)
  });
}

  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

onSubmit() {
  // LOGIC FIX: Ensure we send a valid date string, not the text "Ending of session"
  let finalUntilDate = null;
  
  if (this.selectedType === 'Recurring') {
      // If the user picked a custom date, use that; otherwise use untilDate
      finalUntilDate = this.data.customUntilDate || this.data.untilDate;
  }

  const bookingPayload = {
    room_name: this.roomName,
    booking_date: this.selectedDate,
    period: this.data.period,
    subject: this.data.department,
    booked_by: this.selectedStaff,
    booking_type: this.selectedType,
    until_date: finalUntilDate, // Now sends an actual date string
    status: 'Confirmed'
  };

  console.log('Sending Payload:', bookingPayload); // Debugging for your talk

  this.http.post('http://localhost:3000/api/bookings', bookingPayload).subscribe({
    next: (res) => {
      alert('Booking saved successfully!');
      this.create.emit(res);
      this.close.emit();
      // Using a local data refresh is better, but reload works for the demo
      window.location.reload(); 
    },
    error: (err) => {
      console.error('Booking failed', err);
      alert('Failed to save booking. Ensure all fields are filled.');
    }
  });
}

  closeModal() {
    this.close.emit();
  }
}