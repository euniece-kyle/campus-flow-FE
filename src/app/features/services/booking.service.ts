import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:3000/api/flow'; 

  constructor(private http: HttpClient) {}

  // This is the function your modal is looking for!
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
  getUserProfile() {
    return this.http.get<any>('http://localhost:3000/api/auth/profile');
  }
  createBooking(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings`, payload);
  }
}