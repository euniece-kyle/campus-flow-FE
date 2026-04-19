import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private bookingsSubject = new BehaviorSubject<any[]>([]);
  bookings$ = this.bookingsSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api/bookings';

  constructor(private http: HttpClient) {
    // 1. First, load from localStorage for instant UI
    const saved = localStorage.getItem('campus_bookings');
    if (saved) {
      try {
        this.bookingsSubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Could not parse saved bookings', e);
      }
    }
    // 2. Then, immediately fetch fresh data from the Database
    this.loadAllBookings();
  }

  loadAllBookings() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.bookingsSubject.next(data);
        localStorage.setItem('campus_bookings', JSON.stringify(data));
      },
      error: (err) => console.error('Failed to load bookings from API', err)
    });
  }

  updateBookings(bookings: any[]) {
    this.bookingsSubject.next(bookings);
    localStorage.setItem('campus_bookings', JSON.stringify(bookings));
  }
}