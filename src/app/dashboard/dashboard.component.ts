// import { Component, OnInit } from '@angular/core';
// import { NgxChartsModule, Color } from '@swimlane/ngx-charts';
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { DashboardService } from '../services/dashboard.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, NgxChartsModule, HttpClientModule],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent implements OnInit {
  
//   lineChartData: { name: string, series: { name: string, value: number }[] }[] = [];
//   colorScheme: string = 'flame';

//   cards = [
//     { title: 'Record Test Cases', total: 0 },
//     { title: 'Recent Test Cases', total: 0 },
//     { title: 'Requested Test Cases', total: 0 } // Added back Requested Test Cases
//   ];

//   progressValue = 0;
//   passedTestCases = 0;
//   failedTestCases = 0;

//   constructor(private dashboardService: DashboardService) {}

//   ngOnInit(): void {
//     this.fetchDashboardData();
//   }

//   fetchDashboardData(): void {
//     this.dashboardService.getDashboardData().subscribe(records => {
//       // Find the global test stats
//       const globalStats = records.find(record => record._id === 'globalTestStats');
//       const recentStats = records.find(record => record.recentTestCases !== undefined);

//       if (globalStats) {
//         this.cards[0].total = globalStats.totalTestCases || 0;
//         // You might want to set Requested Test Cases to a specific value or calculation
//         this.cards[2].total = 0; // Set to 0 by default
//       }

//       if (recentStats) {
//         this.cards[1].total = recentStats.recentTestCases || 0;
//         this.passedTestCases = recentStats.recentPassed || 0;
//         this.failedTestCases = recentStats.recentFailed || 0;

//         // Calculate progress (accuracy)
//         const totalTests = this.passedTestCases + this.failedTestCases;
//         this.progressValue = totalTests > 0 
//           ? Math.round((this.passedTestCases / totalTests) * 100) 
//           : 0;

//         // Update line chart data
//         this.updateLineChartData(recentStats);
//       }
//     });
//   }

//   updateLineChartData(recentStats: any): void {
//     this.lineChartData = [
//       {
//         name: 'Passed Test Cases',
//         series: [{ name: 'Passed', value: recentStats.recentPassed || 0 }]
//       },
//       {
//         name: 'Failed Test Cases',
//         series: [{ name: 'Failed', value: recentStats.recentFailed || 0 }]
//       }
//     ];
//   }
// }



import { Component, OnInit } from '@angular/core';
import { NgxChartsModule, Color } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  lineChartData: { name: string, series: { name: string, value: number }[] }[] = [];
  colorScheme: string = 'flame';

  cards = [
    { title: 'Record Test Cases', total: 0 },
    { title: 'Recent Test Cases', total: 0 },
    { title: 'Requested Test Cases', total: 0 }
  ];

  progressValue = 0;
  passedTestCases = 0;
  failedTestCases = 0;
  generationStats = {
    firstRequestTimestamp: null as string | null,
    lastRequestTimestamp: null as string | null,
    lastCodeLength: 0
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe(records => {
      // Find the global test stats
      const globalStats = records.find(record => record._id === 'globalTestStats');
      const recentStats = records.find(record => record.recentTestCases !== undefined);
      const generationStats = records.find(record => record._id === 'testCaseGenerationStats');

      if (globalStats) {
        this.cards[0].total = globalStats.totalTestCases || 0;
      }

      if (recentStats) {
        this.cards[1].total = recentStats.recentTestCases || 0;
        this.passedTestCases = recentStats.recentPassed || 0;
        this.failedTestCases = recentStats.recentFailed || 0;

        // Calculate progress (accuracy)
        const totalTests = this.passedTestCases + this.failedTestCases;
        this.progressValue = totalTests > 0 
          ? Math.round((this.passedTestCases / totalTests) * 100) 
          : 0;

        // Update line chart data
        this.updateLineChartData(recentStats);
      }

      // Set Requested Test Cases and Generation Stats
      if (generationStats) {
        this.cards[2].total = generationStats.totalGenerationRequests || 0;
        this.generationStats = {
          firstRequestTimestamp: generationStats.firstRequestTimestamp 
            ? new Date(generationStats.firstRequestTimestamp).toLocaleString() 
            : 'N/A',
          lastRequestTimestamp: generationStats.lastRequestTimestamp 
            ? new Date(generationStats.lastRequestTimestamp).toLocaleString() 
            : 'N/A',
          lastCodeLength: generationStats.lastCodeLength || 0
        };
      }
    });
  }

  updateLineChartData(recentStats: any): void {
    this.lineChartData = [
      {
        name: 'Passed Test Cases',
        series: [{ name: 'Passed', value: recentStats.recentPassed || 0 }]
      },
      {
        name: 'Failed Test Cases',
        series: [{ name: 'Failed', value: recentStats.recentFailed || 0 }]
      }
    ];
  }
}