import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GlobalLoaderService } from './global-loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  readonly loader = inject(GlobalLoaderService);
  readonly sidebarOpen = signal(false);
  closeSidebar() {
    this.sidebarOpen.set(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
  openDashboard() {
    window.location.replace('http://192.168.29.101:90/dashboard');
  }
  logout() {
    window.location.replace('http://192.168.29.101:90');
  }
}
