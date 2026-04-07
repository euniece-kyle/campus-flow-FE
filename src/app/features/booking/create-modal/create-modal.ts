import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// This tells TypeScript exactly what a "Period" looks like
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
export class CreateModal {
  @Input() roomName: string = '';
  @Input() selectedDate: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  selectedType: 'One-Time' | 'Recurring' = 'One-Time';

  data: any = {
    period: '',
    department: '(None)',
    bookedBy: 'Mr. Yuri Hanamichi',
    startDate: '',
    untilDate: 'Ending of session'
  };

  // FIXED: Every object now has a 'time' property
  periods: Period[] = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH',    time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  departments = ['(None)', 'IT', 'Engineering', 'Science', 'Mathematics'];
  
  staff = [
    'Mr. Yuri Hanamichi', 
    'Mr. Gojo Satoru', 
    'Ms. Makima', 
    'Mr. Kakashi Hatake'
  ];

  selectType(type: 'One-Time' | 'Recurring') {
    this.selectedType = type;
  }

  closeModal() {
    this.close.emit();
  }

  onCreateBooking() {
    const bookingPayload = {
      room: this.roomName,
      type: this.selectedType,
      ...this.data 
    };
    this.create.emit(bookingPayload);
    this.closeModal();
  }
}