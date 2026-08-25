import { CommonModule } from '@angular/common';
import { Component, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  readonly sidebarOpen = signal(false);
  readonly today = new Date();
  constructor(public router: Router) {}
  get isSales() {
    return this.router.url.startsWith('/sales');
  }
  get sectionTitle() {
    return this.isSales ? 'Sales operations' : 'Customer data';
  }
  get pageTitle() {
    if (this.router.url.startsWith('/sales/import')) return 'Import Center';
    if (this.router.url.startsWith('/sales/view')) return 'Lead Register';
    if (this.router.url.startsWith('/sales/find')) return 'Company Lookup';
    return 'Customer Master';
  }
  logout() {
    window.location.replace('http://192.168.29.101:90');
  }
}
