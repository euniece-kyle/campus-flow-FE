import { Component, OnInit, inject, ViewChild } from '@angular/core';   //UPDATE TS
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service'; 

// --- 1. Import Chart.js core and Registerables ---
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';

// --- 2. Manually Register scales and elements to fix "linear" error ---
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  buildings: string[] = ['SAC', 'NAC', 'WAC', 'EAC'];
  roomsPerBuilding: number = 5;
  periodsPerDay: number = 6; 

  totalRooms: number = 20; 
  activeBookings: number = 0; 
  availableNow: number = 20; 
  dailyTotal: number = 0;     

  todaysBookings: any[] = [];     
  isListVisible: boolean = false; 

  // --- Chart Navigation State ---
  currentDateRange: number = 7; 
  private allSystemBookings: any[] = []; 

  private roomService = inject(RoomService);

  // --- LINE CHART CONFIGURATION ---
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Booking Volume',
        fill: true,
        tension: 0.4,
        borderColor: '#8b0000',           // Maroon
        backgroundColor: 'rgba(152, 8, 8, 0.15)', 
        pointBackgroundColor: '#8b0000',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b0000',
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

  // --- BAR CHART CONFIGURATION (Updated for Dates & Buildings) ---
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [] // Dynamic datasets built in updateCharts()
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { 
        stacked: true, // Stacked for cleaner look on small scroll widths
        grid: { display: false } 
      },
      y: { 
        stacked: true,
        beginAtZero: true, 
        type: 'linear', 
        ticks: { stepSize: 1 } 
      }
    }
  };

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.totalRooms = this.buildings.length * this.roomsPerBuilding;
    
    this.roomService.bookings$.subscribe((allBookings: any[]) => {
      this.allSystemBookings = allBookings;
      this.calculateLiveStats(allBookings);
      this.processDataByRange(allBookings); 
    });
  }

  calculateLiveStats(allBookings: any[]): void {
    const todayStr = new Date().toDateString();
    this.dailyTotal = allBookings.length;
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

      filteredBookings = allBookings.filter(b => {
        const bookingDate = new Date(b.dateKey);
        return bookingDate >= cutoffDate;
      });
    }

    this.updateCharts(filteredBookings);
  }

  updateCharts(bookingsToUse: any[]): void {
    // 1. Unified Date Map (Same for both charts)
    const dateMap: { [key: string]: number } = {};
    bookingsToUse.forEach(b => {
      dateMap[b.dateKey] = (dateMap[b.dateKey] || 0) + 1;
    });
    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const displayLabels = sortedDates.map(d => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // --- Line Chart Data ---
    this.lineChartData.labels = displayLabels;
    this.lineChartData.datasets[0].data = sortedDates.map(d => dateMap[d]);

    // --- Bar Chart Data (Grouped by Building per Date) ---
    this.barChartData.labels = displayLabels;
    
    const buildingColors: any = {
      'SAC': '#f5a81c', // Gold
      'NAC': '#4a0000', // Maroon
      'WAC': '#326284', // Blue
      'EAC': '#E68D76'  // Salmon
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

    // Manual update for redraw
    this.chart?.update();
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