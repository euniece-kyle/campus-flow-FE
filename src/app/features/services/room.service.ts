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
    this.loadAllBookings();
  }

  // FIXED: Force real-time fetch from MySQL only
  loadAllBookings() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
        this.bookingsSubject.next(sortedData);
      },
      error: (err) => console.error('Failed to load bookings from API', err)
    });
  }

  // FIXED: Helper to get the actual logged-in user for the Booking Modal
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : { firstName: 'Guest', lastName: '' };
  }

  updateBookings(bookings: any[]) {
    this.bookingsSubject.next(bookings);
  }
}