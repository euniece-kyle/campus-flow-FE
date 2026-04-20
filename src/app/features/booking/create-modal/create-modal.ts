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
  subjects: string[] = ['Art', 'Math', 'Science', 'Drama', 'Languages'];
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
    // FIXED: Pre-populate staff dropdown with users from DB
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => { 
        this.staff = data; 
        this.initializeUser();
      },
      error: (err) => {
        console.error('Connection failed:', err);
        this.initializeUser();
      }
    });

    // FIXED: Fetch real subjects from DB
    this.http.get<any[]>('http://localhost:3000/api/subjects').subscribe({
      next: (data) => { if(data.length > 0) this.subjects = data.map(s => s.name); }
    });
  }

  // FIXED: Logic to auto-populate "Booked By" based on session
  initializeUser() {
    const activeProfile = localStorage.getItem('user_profile');
    if (activeProfile) {
      const user = JSON.parse(activeProfile);
      this.selectedStaff = user.username || `${user.firstName} ${user.lastName}`;
    } else {
      this.selectedStaff = this.bookedBy || "Precious Fillalan"; 
    }

    if (!this.staff.find(s => s.username === this.selectedStaff)) {
      this.staff.unshift({ username: this.selectedStaff });
    }
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
      until_date: this.selectedType === 'Recurring' 
        ? (this.data.untilDate === 'Ending of session' ? null : this.data.customUntilDate)
        : null,
      status: 'Confirmed'
    };

    // FIXED: Use correct endpoint and payload for real-time creation
    this.http.post('http://localhost:3000/api/bookings', bookingPayload)
      .subscribe({
        next: (response: any) => {
          this.create.emit(bookingPayload);
          this.close.emit();
        },
        error: (err) => {
          console.error('Frontend Error:', err);
          alert('Submission failed. Check backend terminal!');
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
}