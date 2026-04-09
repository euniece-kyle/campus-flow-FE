import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  selectedType: 'One-Time' | 'Recurring' = 'One-Time';

  data: any = {
    period: '',
    department: '', // This will hold the selected Subject name
    bookedBy: 'Mr. Yuri Hanamichi',
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

  // Renamed to subjects to match your new naming convention
  subjects: string[] = [];
  staff = ['Mr. Yuri Hanamichi', 'Mr. Gojo Satoru', 'Ms. Makima', 'Mr. Kakashi Hatake'];

  ngOnInit() {
    // 1. Load Subjects from LocalStorage (using the key from Subject page)
    const savedSubjects = localStorage.getItem('campus_departments');
    if (savedSubjects) {
      this.subjects = JSON.parse(savedSubjects);
    } else {
      // Default fallback
      this.subjects = ['Art', 'Math', 'Science', 'History'];
    }

    // 2. Setup initial dates
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
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return d.toLocaleDateString('en-US', options);
  }

  onUntilChange() {
    this.data.showDatePicker = (this.data.untilDate === 'Pick Date');
  }

  closeModal() {
    this.close.emit();
  }

  onCreateBooking() {
    const finalUntil = this.data.showDatePicker 
      ? this.formatToWords(this.data.customUntilDate) 
      : this.data.untilDate;
    
    const bookingPayload = {
      room: this.roomName,
      type: this.selectedType,
      bookedBy: this.data.bookedBy,
      period: this.data.period,
      department: this.data.department, // This is the Subject the user chose
      startingFrom: this.formatToWords(this.data.startDate),
      until: finalUntil
    };
    
    this.create.emit(bookingPayload);
    this.closeModal();
  }
}