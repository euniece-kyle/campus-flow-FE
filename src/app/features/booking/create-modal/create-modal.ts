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
  
  // FIX: Added back for the 'One-Time' vs 'Recurring' toggle in HTML
  selectedType: 'One-Time' | 'Recurring' = 'One-Time';
  
  staff: any[] = []; 
  selectedStaff: string = ''; 
  subjects: string[] = ['Art', 'Math', 'Science', 'Drama', 'Languages'];

  data: any = {
    period: '',
    department: '', 
    untilDate: 'Ending of session', // Added back for template binding
    showDatePicker: false          // Added back for template binding
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

  // FIX: Added back to handle the "Recurring" date picker logic in HTML
  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

  onSubmit() {
    const bookingPayload = {
      room: this.roomName,
      date: this.selectedDate,
      period: this.data.period,
      subject: this.data.department,
      bookedBy: this.selectedStaff 
    };

    this.http.post('http://localhost:3000/api/create', bookingPayload)
      .subscribe({
        next: (response: any) => {
          alert('Booking saved to MySQL!');
          this.create.emit(bookingPayload);
          this.close.emit();
        },
        error: (err) => {
          console.error('Frontend Error:', err);
          alert('Error saving to database! Check backend terminal.');
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
}