import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BookingService } from '../../services/booking.service';

interface Period {
  label: string;
  time: string;
}

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
  subjects: string[] = [];
  
  staff: any[] = []; 
  selectedStaff: string = ''; 

  data: any = {
    period: '',
    department: '',
    startDate: '',         
    untilDate: 'Ending of session',
    customUntilDate: '',    
    showDatePicker: false   
  };

  periods: Period[] = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH',    time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  constructor(private bookingService: BookingService, private http: HttpClient) {}

  ngOnInit() {
    // This matches your flowRouter.get('/users') route
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => {
        this.staff = data;
      },
      error: (err) => console.error('Connection failed:', err)
    });

    const activeProfile = localStorage.getItem('user_profile');
    if (activeProfile) {
      const user = JSON.parse(activeProfile);
      this.selectedStaff = user.username || `${user.firstName} ${user.lastName}`;
    } else {
      this.selectedStaff = this.bookedBy || "Guest"; 
    }

    const d = new Date(this.selectedDate);
    const finalDate = isNaN(d.getTime()) ? new Date() : d;
    this.data.startDate = this.toISODate(finalDate);
    this.data.customUntilDate = this.data.startDate;

    const savedSubjects = localStorage.getItem('campus_departments');
    this.subjects = savedSubjects ? JSON.parse(savedSubjects) : ['Art', 'Math', 'Science'];
  }

  onSubmit() {
    // These keys (room, date, period, etc.) MUST match the names 
    // you used in flow.route.ts
    const bookingPayload = {
      room: this.roomName,
      date: this.selectedDate,
      period: this.data.period,
      subject: this.data.department,
      bookedBy: this.selectedStaff 
    };

    console.log('Attempting save to backend:', bookingPayload);

    // FIXED URL: index.ts (/api) + flow.route.ts (/create)
    this.http.post('http://localhost:3000/api/create', bookingPayload)
      .subscribe({
        next: (response: any) => {
          console.log('Success!', response);
          alert('Booking saved to MySQL!');
          this.create.emit(bookingPayload);
          this.close.emit();
        },
        error: (err) => {
          console.error('MySQL Insert Failed:', err);
          alert('Error saving to database! Check the backend terminal for red text.');
        }
      });
  }

  toISODate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  }

  formatToWords(dateStr: string): string {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

  closeModal() {
    this.close.emit();
  }
}