import { Component, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  readonly sidebarOpen = signal(false);
  closeSidebar() {
    this.sidebarOpen.set(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
  logout() {
    window.location.replace('http://192.168.29.101:90');
  }
}
