import { Component, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector:'app-root',
  imports:[RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl:'./app.html',
  styleUrl:'./app.scss',
  encapsulation:ViewEncapsulation.None
})
export class App {
  readonly sidebarOpen=signal(false);
  constructor(public router:Router){}
  get isSales(){return this.router.url.startsWith('/sales')}
}
