import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
  cppFiles: { filename: string, content: string }[] = []; // Store fetched cpp files

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {}

  fetchCppFiles() {
    const linkInput = (document.getElementById('linkInput') as HTMLInputElement).value;
    const specialInstructions = (document.getElementById('specialInstructionsInput') as HTMLTextAreaElement).value;
    const repoUrl = this.extractRepoUrl(linkInput);

    if (repoUrl) {
      this.fetchMostRecentCppFiles(repoUrl).then(files => {
        this.cppFiles = files;
      }).catch(error => {
        console.error('Error fetching the most recent .cpp files:', error);
      });
    } else {
      console.error('Invalid GitHub repository URL');
    }
  }

  extractRepoUrl(link: string): string | null {
    const match = link.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+/);
    return match ? match[0] : null;
  }

  async fetchMostRecentCppFiles(repoUrl: string): Promise<{ filename: string, content: string }[]> {
    try {
      // Construct the URL to fetch commits
      const commitsUrl = `${repoUrl.replace('https://github.com/', 'https://api.github.com/repos/')}/commits`;

      // Define headers with the authentication token
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`
      });

      // Fetch commits from the GitHub API with authentication
      const commits = await this.http.get<any[]>(commitsUrl, { headers }).toPromise();

      // Check if commits are available
      if (!commits || commits.length === 0) {
        throw new Error('No commits found in the repository.');
      }

      // Find the most recent commit URL
      const mostRecentCommitUrl = commits[0].url;

      // Fetch the most recent commit data from GitHub API with authentication
      const commitData = await this.http.get<any>(mostRecentCommitUrl, { headers }).toPromise();

      // Extract files from the most recent commit data
      const files = commitData.files;

      // Filter and fetch content of .cpp files
      const cppFiles = [];
      for (const file of files) {
        if (file.filename.endsWith('.cpp')) {
          const fileContent = await this.http.get<any>(file.contents_url, { headers }).toPromise();
          cppFiles.push({ filename: file.filename, content: atob(fileContent.content) });
        }
      }

      return cppFiles;
    } catch (error) {
      console.error('Error fetching commits or files:', error);
      throw error;
    }
  }

  navigateToTestGeneratedPage(content: string) {
    // Get the special instructions from the input field
    const specialInstructions = (document.getElementById('specialInstructionsInput') as HTMLTextAreaElement).value;

    // Navigate to the "test-generator" page and pass the selected file content and special instructions as query parameters
    this.router.navigate(['/test-generator'], { 
      queryParams: { code: content, instructions: specialInstructions } 
    });
  }
}
