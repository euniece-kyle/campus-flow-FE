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
  
  // FIX FOR LINE 49: Adding the staff array
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
    // Load subjects from MySQL
    this.http.get<any[]>('http://localhost:3000/api/subjects').subscribe({
      next: (res) => this.subjects = res,
      error: (err) => console.error('Subject Load Error', err)
    });

    // Load users/staff from MySQL to fix the dropdown
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (res) => {
        this.staff = res;
        this.selectedStaff = this.bookedBy || "Precious Fillalan";
      },
      error: (err) => console.error('User Load Error', err)
    });
  }

  // FIX FOR LINE 65: Adding the missing function
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
      status: 'Confirmed'
    };

    this.http.post('http://localhost:3000/api/bookings', bookingPayload).subscribe({
      next: (response: any) => {
        this.create.emit(response);
        this.close.emit();
      },
      error: (err) => alert('Save failed!')
    });
  }

  closeModal() {
    this.close.emit();
  }
}