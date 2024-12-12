import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodeService } from '../app/services/code.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,RouterOutlet,NavbarComponent,NgxChartsModule, HttpClientModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-app';
}
