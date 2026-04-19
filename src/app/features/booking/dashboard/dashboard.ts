import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service'; 

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
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  isListVisible: boolean = false;
  currentDateRange: number = 7;
  todaysBookings: any[] = [];
  dailyTotal: number = 0;
  periodsPerDay: number = 6;
  // Stats Logic
  buildings: string[] = ['SAC', 'NAC', 'WAC', 'EAC'];
  totalRooms: number = 20; 
  activeBookings: number = 0; 
  availableNow: number = 20; 
  
  private allSystemBookings: any[] = []; 
  private roomService = inject(RoomService);

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Booking Volume',
        fill: true,
        tension: 0.4,
        borderColor: '#8b0000',
        backgroundColor: 'rgba(152, 8, 8, 0.15)', 
        pointBackgroundColor: '#8b0000',
        pointBorderColor: '#fff',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, type: 'linear', ticks: { stepSize: 1 } }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [] 
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, type: 'linear', ticks: { stepSize: 1 } }
    }
  };

  constructor(public router: Router) {}

ngOnInit(): void {
    // Listen to the room service for any changes in bookings
    this.roomService.bookings$.subscribe((allBookings: any[]) => {
      if (allBookings && allBookings.length > 0) {
        this.allSystemBookings = allBookings;
        this.updateDashboardStats(allBookings);
        this.processDataByRange(7); // Default to 7 days
      }
    });
  }

  updateDashboardStats(bookings: any[]): void {
    const today = new Date().toDateString();
    // Filter bookings that match today's date
    const todaysBookings = bookings.filter(b => b.dateKey === today);
    
    this.activeBookings = todaysBookings.length;
    this.availableNow = this.totalRooms - this.activeBookings;
  }

calculateLiveStats(allBookings: any[]): void {
  const todayStr = new Date().toDateString();
  this.dailyTotal = allBookings.length; // Now this will work!
  this.todaysBookings = allBookings.filter(b => b.dateKey === todayStr);
  this.activeBookings = this.todaysBookings.length;
  this.availableNow = this.totalRooms - this.activeBookings;
}

  changeDateRange(days: number): void {
    this.currentDateRange = days;
    this.processDataByRange(this.allSystemBookings);
  }

  processDataByRange(allBookings: any[]): void {
    let filteredBookings = [...allBookings];
    if (this.currentDateRange > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.currentDateRange);
      cutoffDate.setHours(0, 0, 0, 0);
      filteredBookings = allBookings.filter(b => new Date(b.dateKey) >= cutoffDate);
    }
    this.updateCharts(filteredBookings);
  }

  updateCharts(bookingsToUse: any[]): void {
    const dateMap: { [key: string]: number } = {};
    bookingsToUse.forEach(b => {
      dateMap[b.dateKey] = (dateMap[b.dateKey] || 0) + 1;
    });
    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const displayLabels = sortedDates.map(d => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    this.lineChartData.labels = displayLabels;
    this.lineChartData.datasets[0].data = sortedDates.map(d => dateMap[d]);

    this.barChartData.labels = displayLabels;
    
    const buildingColors: any = {
      'SAC': '#f5a81c', 'NAC': '#4a0000', 'WAC': '#326284', 'EAC': '#E68D76'
    };

    this.barChartData.datasets = this.buildings.map(bName => ({
      label: bName,
      data: sortedDates.map(date => 
        bookingsToUse.filter(b => b.dateKey === date && b.room.startsWith(bName)).length
      ),
      backgroundColor: buildingColors[bName] || '#ccc',
      borderColor: '#fff',
      borderWidth: 1,
      stack: 'buildingStack'
    }));

    if (this.chart) {
       this.chart.update();
    }
    setTimeout(() => {
  if (this.chart && this.chart.chart) {
    this.chart.chart.update();
  }
}, 100);
  }

  toggleBookingList(): void {
    this.isListVisible = !this.isListVisible;
  }

  clearAllBookings(): void {
    if(confirm('Are you sure you want to clear all data?')) {
      localStorage.removeItem('campus_bookings');
      this.roomService.updateBookings([]);
      this.isListVisible = false;
    }
  }

  onSignOut(): void {
    this.router.navigate(['/login']);
  }
}