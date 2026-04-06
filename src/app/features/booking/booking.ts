import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss'],
  providers: [DatePipe]
})
export class BookingComponent {
  selectedBuilding: string = 'WAC Building';
  selectedDate: Date = new Date(2026, 0, 1); // January 1, 2026

  buildings: string[] = ['SAC Building', 'NAC Building', 'WAC Building', 'EAC Building'];
  rooms: string[] = ['WAC 201', 'WAC 202', 'WAC 203', 'WAC 204', 'WAC 205'];
  
  periods = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH', time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  // Formats the date for the hidden input (yyyy-MM-dd)
  get dateForInput(): string {
    return this.selectedDate.toISOString().split('T')[0];
  }

  // Updates the banner when calendar changes
  onDateChange(event: any) {
    const val = event.target.value;
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      this.selectedDate = new Date(year, month - 1, day);
    }
  }

  changeDate(offset: number) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + offset);
    this.selectedDate = d;
  }
}