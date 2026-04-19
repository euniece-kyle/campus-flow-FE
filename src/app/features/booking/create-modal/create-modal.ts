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
  
  // RESTORED: This fixes the UI buttons for 'One-Time' vs 'Recurring'
  selectedType: 'One-Time' | 'Recurring' = 'One-Time';
  
  // FIX: This solves the TS2339 'subjects' error in your terminal
  subjects: string[] = ['Art', 'Math', 'Science', 'Drama', 'Languages'];

  staff: any[] = []; 
  selectedStaff: string = ''; 

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
    // Fetch user list for the 'Booked By' dropdown
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => { this.staff = data; },
      error: (err) => console.error('Connection failed:', err)
    });

    const activeProfile = localStorage.getItem('user_profile');
    if (activeProfile) {
      const user = JSON.parse(activeProfile);
      this.selectedStaff = user.username || `${user.firstName} ${user.lastName}`;
    } else {
      this.selectedStaff = this.bookedBy || "Guest"; 
    }
  }

  // RESTORED: Needed for the 'Recurring' date picker logic
  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

  onSubmit() {
    const bookingPayload = {
      room: this.roomName,
      date: this.selectedDate,
      period: this.data.period,
      subject: this.data.department, // Maps to 'department_id' if needed later
      bookedBy: this.selectedStaff,
      bookingType: this.selectedType,
      untilDate: this.data.untilDate === 'Ending of session' ? null : this.data.untilDate
    };

    this.http.post('http://localhost:3000/api/create', bookingPayload)
      .subscribe({
        next: (response: any) => {
          this.create.emit(bookingPayload);
          this.close.emit();
        },
        error: (err) => {
          console.error('Frontend Error:', err);
          alert('Check backend terminal for red text!');
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
}