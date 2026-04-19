import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BookingService } from '../.././services/booking.service';

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
  
  // ONE declaration for staff and selectedStaff
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
    // 1. Fetch staff from the API
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => {
        this.staff = data;
        console.log('Names loaded from DB:', this.staff);
      },
      error: (err) => console.error('Connection failed:', err)
    });

    // 2. Set the default logged-in user
    const activeProfile = localStorage.getItem('user_profile');
    if (activeProfile) {
      const user = JSON.parse(activeProfile);
      // This sets the initial dropdown value
      this.selectedStaff = user.username || `${user.firstName} ${user.lastName}`;
    } else {
      this.selectedStaff = this.bookedBy || "Guest"; 
    }

    // 3. Set Date defaults
    const d = new Date(this.selectedDate);
    const finalDate = isNaN(d.getTime()) ? new Date() : d;
    this.data.startDate = this.toISODate(finalDate);
    this.data.customUntilDate = this.data.startDate;

    // 4. Load Subjects/Departments
    const savedSubjects = localStorage.getItem('campus_departments');
    this.subjects = savedSubjects ? JSON.parse(savedSubjects) : ['Art', 'Math', 'Science'];
  }

  onSubmit() {
    const bookingPayload = {
      room: this.roomName,
      date: this.selectedDate,
      period: this.data.period,
      subject: this.data.department,
      bookedBy: this.selectedStaff 
    };

    this.http.post('http://localhost:3000/api/flow/create', bookingPayload)
      .subscribe({
        next: (response: any) => {
          console.log('Successfully saved to MySQL!', response);
          this.create.emit(bookingPayload);
          this.close.emit();
        },
        error: (err) => {
          console.error('MySQL Insert Failed:', err);
          alert('Error saving to database!');
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