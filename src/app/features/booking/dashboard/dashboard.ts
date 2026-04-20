import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  // Matched exactly to your dashboard.html property names
  stats = { 
    totalBookings: 0, 
    totalSubjects: 0,
    availableNow: 20 
  };
  
  @ViewChild(BaseChartDirective) chart: any;

  isListVisible: boolean = false;
  currentDateRange: number = 7;
  todaysBookings: any[] = [];
  
  private allSystemBookings: any[] = []; 
  private roomService = inject(RoomService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    // Fetch statistics from your Hono backend
    this.http.get<any>('http://localhost:3000/api/stats').subscribe({
      next: (data) => { 
        this.stats.totalBookings = data.totalBookings || 0;
        this.stats.totalSubjects = data.totalSubjects || 0;
      },
      error: (err) => console.error('Stats fetch failed', err)
    });

    this.roomService.bookings$.subscribe((allBookings: any[]) => {
      if (allBookings) {
        this.allSystemBookings = allBookings;
      }
    });
    this.roomService.loadAllBookings();
  }

  // FIXED: Renamed to match the (click) event in dashboard.html line 33
  toggleBookingList() {
    this.isListVisible = !this.isListVisible;
  }
}