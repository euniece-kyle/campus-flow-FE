import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  users: any[] = []; // To store names from database
  selectedUser: string = '';

  data: any = {
    period: '',
    department: '', 
    bookedBy: '', 
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

    // ✅ THIS MUST BE INSIDE THE CLASS BRACES
  constructor(private bookingService: BookingService) {}

  subjects: string[] = [];
  staff: string[] = [];

  ngOnInit() {
    this.bookingService.getUsers().subscribe({
      next: (users: any[]) => {
        this.staff = users.map(u => u.username); 
        const activeProfile = localStorage.getItem('user_profile');
        if (!this.bookedBy) {
      this.bookedBy = "Retrieving user..."; 
      }
      },
      error: (err: any) => console.error('Error fetching users:', err)
    });


    const savedSubjects = localStorage.getItem('campus_departments');
    if (savedSubjects) {
      this.subjects = JSON.parse(savedSubjects);
    } else {
      this.subjects = ['Art', 'Math', 'Science', 'History'];
    }

    const d = new Date(this.selectedDate);
    let finalDate = d;
    if (isNaN(d.getTime())) {
       finalDate = new Date(); 
    }

    const isoDate = this.toISODate(finalDate);
    this.data.startDate = isoDate;
    this.data.customUntilDate = isoDate;
  }

  toISODate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  }

  formatToWords(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }

  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

  closeModal() {
    this.close.emit();
  }
onSubmit() {
    // 1. Create the data package to send to your MySQL database
    const bookingPayload = {
      room: this.roomName,
      date: this.selectedDate,
      type: this.selectedType,
      bookedBy: this.bookedBy, // This uses the name from your API/Input
      period: this.data.period,
      subject: this.data.subject,
      department: this.data.department,
      startingFrom: this.data.startingFrom,
      until: this.data.until
    };

    // 2. Emit the data to the parent (booking.ts) so it can call your API
    this.create.emit(bookingPayload);
    
    // 3. Close the modal after clicking create
    this.close.emit();
  }
}