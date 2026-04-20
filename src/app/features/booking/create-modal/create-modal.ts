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
  @Input() bookedBy: string = ''; // FIXED: Added to resolve Line 152 error in booking.html
  
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  subjects: any[] = [];
  staff: any[] = []; 
  selectedStaff: string = ''; 
  selectedType: 'One-Time' | 'Recurring' = 'One-Time';

  data: any = {
    period: '',
    department: '', 
    untilDate: 'Ending of session',
    showDatePicker: false
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.targetPeriod) {
      this.data.period = this.targetPeriod;
    }
    
    // FIXED: Default the selected staff to the user display name passed from parent
    this.selectedStaff = this.bookedBy;

    this.http.get<any[]>('http://localhost:3000/api/subjects').subscribe(res => this.subjects = res);
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe(res => this.staff = res);
  }

  onSubmit() {
    // FIXED: Payload construction ensures booking_date is sent as a clean string
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
      next: (res) => {
        alert('Booking saved successfully!');
        this.create.emit(res); 
        this.close.emit();
      },
      error: (err) => {
        console.error('Submit Error:', err);
        alert('Failed to save booking.');
      }
    });
  }

  onUntilChange() { this.data.showDatePicker = (this.data.untilDate === 'Pick Date'); }
  closeModal() { this.close.emit(); }
}