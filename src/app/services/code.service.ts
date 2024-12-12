import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private apiUrl = 'http://localhost:3000/api'; // Base URL for the API

  constructor(private http: HttpClient) { }

  // Updated method to send code and special instructions to the backend
  sendCodeToBackend(code: string, specialInstructions: string) {
    return this.http.post<any>(`${this.apiUrl}/generate-test-cases`, { code, specialInstructions });
  }

  // Method to validate test cases
  validateTestCases(testCases: string) {
    return this.http.post<any>(`${this.apiUrl}/validate-test-cases`, { testCases });
  }
}
