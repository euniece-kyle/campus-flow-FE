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
  @Input() targetPeriod: string = ''; 
  @Input() bookedBy: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();
  
  staff: any[] = []; 
  subjects: any[] = [];
  selectedStaff: string = ''; 
  selectedType: 'One-Time' | 'Recurring' = 'One-Time';

  data: any = {
    period: '',
    department: '', 
    untilDate: 'Ending of session',
    showDatePicker: false
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
  if (this.targetPeriod) {
      this.data.period = this.targetPeriod;
    }

  this.selectedStaff = this.bookedBy;
  // 1. Load subjects from MySQL
  this.http.get<any[]>('http://localhost:3000/api/subjects').subscribe({
    next: (res) => this.subjects = res,
    error: (err) => console.error('Subject Load Error', err)
  });

  // 2. Load staff AND auto-select current user
  this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
    next: (res) => {
      this.staff = res;
      
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const loggedInUser = JSON.parse(savedUser);
        // Combine names to match the "Booked By" format
        this.selectedStaff = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
      } else {
        this.selectedStaff = "Precious Fillalan"; // Fallback
      }
    },
    error: (err) => console.error('User Load Error', err)
  });
}

onSubmit() {
  // Construct the payload to match your MySQL table columns
  const bookingPayload = {
    room_name: this.roomName,
    booking_date: this.selectedDate, // Ensure this is YYYY-MM-DD
    period: this.data.period,
    subject: this.data.department,
    booked_by: this.selectedStaff,
    booking_type: this.selectedType,
    status: 'Confirmed'
  };

  this.http.post('http://localhost:3000/api/bookings', bookingPayload).subscribe({
    next: (res) => {
      alert('Booking saved successfully!');
      this.create.emit(res);
      this.close.emit(); // Close modal
      window.location.reload(); // Refresh to show on grid
    },
    error: (err) => {
      console.error('Booking failed', err);
      alert('Failed to save booking. Check console for details.');
    }
  });
}

  onUntilChange() { this.data.showDatePicker = (this.data.untilDate === 'Pick Date'); }
  closeModal() {
    this.close.emit();
  }
}