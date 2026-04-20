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
  stats = { totalBookings: 0, totalSubjects: 0 };
  @ViewChild(BaseChartDirective) chart: any;

  // --- Component State ---
  isListVisible: boolean = false;
  currentDateRange: number = 7;
  todaysBookings: any[] = [];
  dailyTotal: number = 0;
  periodsPerDay: number = 6;

  // --- Stats Logic ---
  buildings: string[] = ['SAC', 'NAC', 'WAC', 'EAC'];
  roomsPerBuilding: number = 5;
  maxCapacity: number = 20;
  totalRooms: number = 20;
  activeBookings: number = 0;
  availableNow: number = 20;

  private allSystemBookings: any[] = [];
  private roomService = inject(RoomService);
  private http = inject(HttpClient);
  // Map for Dynamic UI Color-Coding
  private buildingColorMap: { [key: string]: string } = {
    'SAC': '#f5a81c', 'NAC': '#4a0000', 'WAC': '#326284', 'EAC': '#E68D76'
  };
  // --- Chart Configurations ---
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
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, type: 'linear', ticks: { stepSize: 1 } }
    }
  };

  constructor(public router: Router) {}

ngOnInit(): void {
    this.totalRooms = this.buildings.length * this.roomsPerBuilding;

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
      'box-shadow': '0 2px 4px rgba(0,0,0,0.05)'
    };
  }
  // FIXED: Improved stat calculation to handle database nulls and date formats
  updateDashboardStats(allBookings: any[]): void {
    const today = this.formatDate(new Date());

    this.todaysBookings = allBookings.filter(b => {
      if (!b.booking_date) return false;
      const bDate = b.booking_date.includes('T') ? b.booking_date.split('T')[0] : b.booking_date;
      return bDate === today;
    });

    this.activeBookings = this.todaysBookings.length;
    this.totalRooms = this.maxCapacity - this.activeBookings;
    this.availableNow = this.maxCapacity - this.activeBookings;
  }

  private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    this.barChartData.datasets = this.buildings.map(bName => ({
      label: bName,
      data: sortedDates.map(date =>
        bookingsToUse.filter(b => b.booking_date.includes(date) && b.room_name.startsWith(bName)).length
      ),
      backgroundColor: this.buildingColorMap[bName] || '#ccc',
      stack: 'buildingStack'
    }));

    if (this.chart) this.chart.update();
  }

  toggleBookingList(): void {
    this.isListVisible = !this.isListVisible;
  }

  clearAllBookings(): void {
    if(confirm('Are you sure you want to clear all data?')) {
      this.roomService.updateBookings([]);
      this.isListVisible = false;
    }
  }

  onSignOut(): void {
    localStorage.removeItem('currentUser'); // FIXED: Ensure session is cleared
    this.router.navigate(['/login']);
  }
}