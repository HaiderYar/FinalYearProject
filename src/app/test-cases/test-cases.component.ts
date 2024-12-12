import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

declare var Prism: any;

@Component({
  selector: 'app-test-cases',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-cases.component.css']
})
export class TestCasesComponent implements OnInit {
  testCases: string = '';
  terminalOutput: string = ''; // Add a property for terminal output
  formattedTestCases: SafeHtml = '';

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router) {} // Inject Router

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.testCases = decodeURIComponent(params['testCases'] || '');
      this.terminalOutput = localStorage.getItem('terminalOutput') || ''; // Get output from localStorage
      this.formatTestCases();
  
      // Clear terminal output from localStorage after retrieving
      localStorage.removeItem('terminalOutput');
    });
  }
  
  
  


  formatTestCases() {
    this.formattedTestCases = this.sanitizer.bypassSecurityTrustHtml(
      Prism.highlight(this.testCases, Prism.languages.cpp, 'cpp')
    );
  }
}
