import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private bookingsSubject = new BehaviorSubject<any[]>([]);

  bookings$ = this.bookingsSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('campus_bookings');
    if (saved) {
      try {
        this.bookingsSubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Could not parse saved bookings', e);
      }
    }
  }

  updateBookings(bookings: any[]) {
    this.bookingsSubject.next(bookings);
  }
}