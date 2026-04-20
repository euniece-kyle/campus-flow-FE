import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  // FIXED: [error] Added availableNow to the stats object to match dashboard.html line 22
  stats = { 
    totalBookings: 0, 
    totalSubjects: 0,
    availableNow: 0 
  };
  
  @ViewChild(BaseChartDirective) chart: any;

  isListVisible: boolean = false;
  currentDateRange: number = 7;
  todaysBookings: any[] = [];
  totalRooms: number = 20; 
  activeBookings: number = 0; 
  availableNow: number = 20; 
  
  private allSystemBookings: any[] = []; 
  private roomService = inject(RoomService);
  private http = inject(HttpClient);

  private buildingColorMap: { [key: string]: string } = {
    'SAC': '#f5a81c', 'NAC': '#4a0000', 'WAC': '#326284', 'EAC': '#E68D76'
  };

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
        data: [],
        label: 'Booking Volume',
        fill: true,
        tension: 0.4,
        borderColor: '#8b0000',
        backgroundColor: 'rgba(152, 8, 8, 0.15)', 
        pointBackgroundColor: '#8b0000',
        pointBorderColor: '#fff',
    }]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: { legend: { display: true, position: 'top' } },
    scales: { 
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [] 
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/api/stats').subscribe({
      next: (data) => { 
        // FIXED: [logic] Ensuring all stats properties are populated
        this.stats = {
          totalBookings: data.totalBookings || 0,
          totalSubjects: data.totalSubjects || 0,
          availableNow: data.availableNow || 0
        }; 
      },
      error: (err) => console.error('Stats fetch failed', err)
    });

    this.roomService.bookings$.subscribe((allBookings: any[]) => {
      if (allBookings) {
        this.allSystemBookings = allBookings;
        this.updateDashboardStats(allBookings);
        this.processDataByRange(this.currentDateRange);
      }
    });
    this.roomService.loadAllBookings();
  }

  getBookingStyle(roomName: string) {
    const prefix = roomName?.split(' ')[0]; 
    const bgColor = this.buildingColorMap[prefix] || '#e9e9e9';
    return {
      'border-left': `8px solid ${bgColor}`,
      'background-color': '#ffffff',
      'padding': '15px',
      'border-radius': '8px',
      'margin-bottom': '10px',
      'display': 'flex',
      'justify-content': 'space-between',
      'align-items': 'center'
    };
  }

  updateDashboardStats(allBookings: any[]): void {
    const today = this.formatDate(new Date());
    this.todaysBookings = allBookings.filter(b => {
      const bDate = b.booking_date?.includes('T') ? b.booking_date.split('T')[0] : b.booking_date;
      return bDate === today;
    });

    this.activeBookings = this.todaysBookings.length;
    // FIXED: [logic] Syncing local logic with the stats object
    this.stats.availableNow = Math.max(0, this.totalRooms - this.activeBookings);
    this.availableNow = this.stats.availableNow;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  processDataByRange(days: number): void {
    this.currentDateRange = days;
    this.updateCharts(this.allSystemBookings);
  }

  updateCharts(bookingsToUse: any[]): void {
    const dateMap: { [key: string]: number } = {};
    bookingsToUse.forEach(b => {
      const d = b.booking_date.split('T')[0];
      dateMap[d] = (dateMap[d] || 0) + 1;
    });

    const sortedDates = Object.keys(dateMap).sort();
    this.lineChartData.labels = sortedDates;
    this.lineChartData.datasets[0].data = sortedDates.map(d => dateMap[d]);

    this.barChartData.labels = sortedDates;
    this.barChartData.datasets = ['SAC', 'NAC', 'WAC', 'EAC'].map(bName => ({
      label: bName,
      data: sortedDates.map(date => 
        bookingsToUse.filter(b => b.booking_date.includes(date) && b.room_name.includes(bName)).length
      ),
      backgroundColor: this.buildingColorMap[bName],
      stack: 'buildingStack'
    }));

    if (this.chart) this.chart.update();
  }

  toggleBookingList(): void { this.isListVisible = !this.isListVisible; }

  onSignOut(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}