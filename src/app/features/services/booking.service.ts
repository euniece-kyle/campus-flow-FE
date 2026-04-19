import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class BookingService {
  // Ensure this matches your Hono backend port and prefix
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    // This matches FlowController.fetchUsers
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  createBooking(payload: any): Observable<any> {
    // CHANGED from /add to /bookings to match your controller
    return this.http.post<any>(`${this.apiUrl}/bookings`, payload); 
  }
}