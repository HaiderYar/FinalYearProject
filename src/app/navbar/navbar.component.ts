import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faUser, faBell,faCode,faLink,faBars, faGears, faGear } from '@fortawesome/free-solid-svg-icons';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule,RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  faHome = faHome;
  faBell = faBell;
  faUser = faUser;
  faLink = faLink;
  faCode = faCode;
  faBars = faBars;
  faGears = faGears;

  currentTitle = 'Default Title'; // Default title

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Logic to update currentTitle based on the event.url
        this.currentTitle = this.getTitle(event.url); // Implement getTitle method
      }
    });
  }

  getTitle(url: string): string {
    // Logic to determine the title based on the URL
    if (url.includes('/link')) {
      return 'Link';
    }else if(url.includes('/test-generator')){
      return 'Test Case Generator';
    }else if(url.includes('/test-cases')){
      return 'Test Cases';
    } 
    else if (url.includes('/')) {
      return 'Dashboard';
    }
    return 'Default Title';
  }





}
