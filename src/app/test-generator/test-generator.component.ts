import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodeService } from '../services/code.service';
import { HttpClientModule } from '@angular/common/http';

declare var Prism: any;

@Component({
  selector: 'app-test-generated',
  standalone: true,
  imports: [HttpClientModule],
  providers: [CodeService],
  templateUrl: './test-generator.component.html',
  styleUrls: ['./test-generator.component.css']
})
export class TestGeneratorComponent implements OnInit {
  code: string = '';
  formattedCode: SafeHtml = '';
  testCases: string = '';
  specialInstructions: string = ''; // Add a property to store special instructions

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private codeService: CodeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.code = params['code'] || '';
      this.specialInstructions = params['instructions'] || ''; // Retrieve special instructions
      this.formatCode();
      this.generateTestCases();
    });
  }

  formatCode() {
    this.formattedCode = this.sanitizer.bypassSecurityTrustHtml(Prism.highlight(this.code, Prism.languages.cpp, 'cpp'));
  }

  generateTestCases() {
    // Include special instructions in the request to the backend
    this.codeService.sendCodeToBackend(this.code, this.specialInstructions).subscribe(
      response => {
        this.testCases = response.testCases.join('\n');
        this.highlightTestCases();
      },
      error => {
        console.error('Error generating test cases:', error);
      }
    );
  }

  highlightTestCases() {
    setTimeout(() => Prism.highlightAll(), 0);
  }

  onTestButtonClick() {
    // Validate the generated test cases
    this.codeService.validateTestCases(this.testCases).subscribe(
      response => {
        // Store the output in localStorage
        localStorage.setItem('terminalOutput', response.output);
  
        // Navigate to test cases page with generated test cases
        this.router.navigate(['/test-cases'], {
          queryParams: { testCases: encodeURIComponent(this.testCases) }
        });
        console.log('Test cases validated successfully:', response);
      },
      error => {
        console.error('Error validating test cases:', error);
      }
    );
  }
}
