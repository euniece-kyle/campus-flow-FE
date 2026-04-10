import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  // 1. Create a BehaviorSubject to hold the current list of bookings.
  // This allows multiple components to "listen" for changes.
  private bookingsSubject = new BehaviorSubject<any[]>([]);
  
  // 2. Expose the bookings as an Observable so components can subscribe.
  bookings$ = this.bookingsSubject.asObservable();

  constructor() {
    // 3. On initialization, check if there's existing data in LocalStorage.
    const saved = localStorage.getItem('campus_bookings');
    if (saved) {
      try {
        this.bookingsSubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Could not parse saved bookings', e);
      }
    }
  }

  /**
   * Updates the global state of bookings.
   * Called by BookingComponent whenever a room is added or canceled.
   */
  updateBookings(bookings: any[]) {
    this.bookingsSubject.next(bookings);
  }
}