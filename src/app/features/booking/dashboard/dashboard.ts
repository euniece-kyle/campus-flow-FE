import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  stats = { 
    totalBookings: 0, 
    totalSubjects: 0,
    availableNow: 20 
  };
  
  @ViewChild(BaseChartDirective) chart: any;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Booking Volume',
        fill: true,
        tension: 0.5,
        borderColor: '#a80000',
        backgroundColor: 'rgba(168, 0, 0, 0.1)'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  isListVisible: boolean = false;
  currentDateRange: number = 7;
  todaysBookings: any[] = [];
  
  private allSystemBookings: any[] = []; 
  private roomService = inject(RoomService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    // Connects to your Hono backend statsController
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

  // Matches the (click) event in your dashboard.html line 33
  toggleBookingList() {
    this.isListVisible = !this.isListVisible;
  }
}