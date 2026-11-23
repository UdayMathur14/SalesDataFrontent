import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { GlobalLoaderService } from './global-loader.service';
import { SALES_MENU_PERMISSIONS } from './sales-permissions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  readonly loader = inject(GlobalLoaderService);
  private readonly authSession = inject(AuthSessionService);
  readonly menuPermissions = SALES_MENU_PERMISSIONS;
  readonly sidebarOpen = signal(false);
  readonly darkTheme = signal(this.loadTheme());
  closeSidebar() {
    this.sidebarOpen.set(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
  openDashboard() {
    window.location.replace('http://192.168.29.101:90/dashboard');
  }
  toggleTheme() {
    const dark = !this.darkTheme();
    this.darkTheme.set(dark);
    try {
      localStorage.setItem('lead-data-theme', dark ? 'dark' : 'light');
    } catch {}
  }
  canAccess(permissions: readonly string[]): boolean {
    return this.authSession.hasAnyPermission(permissions);
  }
  canAccessLeadData(): boolean {
    return (
      this.canAccess(this.menuPermissions.leadRegister) ||
      this.canAccess(this.menuPermissions.uploadLeads) ||
      this.canAccess(this.menuPermissions.companyLookup)
    );
  }
  logout() {
    this.authSession.clear();
    window.location.replace('http://192.168.29.101:90');
  }
  private loadTheme() {
    try {
      return localStorage.getItem('lead-data-theme') === 'dark';
    } catch {
      return false;
    }
  }
}
