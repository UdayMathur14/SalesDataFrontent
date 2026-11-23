import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  template: `
    <section class="access-denied-page">
      <div class="access-denied-card">
        <span aria-hidden="true">!</span>
        <p>ACCESS RESTRICTED</p>
        <h1>You don't have permission to view this workspace.</h1>
        <small>Your menu access is controlled by the permissions assigned in UMS.</small>
        <button type="button" (click)="openDashboard()">Return to Dashboard</button>
      </div>
    </section>
  `,
  styles: [`
    .access-denied-page { min-height: calc(100vh - 52px); padding: 32px; display: grid; place-items: center; }
    .access-denied-card { width: min(520px, 100%); padding: 42px; border: 1px solid #cddde9; border-radius: 20px; background: #f8fbfd; box-shadow: 0 18px 50px rgba(34, 69, 96, .12); text-align: center; }
    .access-denied-card > span { width: 48px; height: 48px; margin: 0 auto 18px; border-radius: 14px; color: #a63857; background: #f8e7ec; display: grid; place-items: center; font-size: 24px; font-weight: 800; }
    p { margin: 0 0 10px; color: #3568a9; font-size: 11px; font-weight: 850; letter-spacing: 1.6px; }
    h1 { margin: 0; color: #17283a; font-size: clamp(24px, 4vw, 34px); line-height: 1.15; }
    small { max-width: 390px; margin: 14px auto 24px; color: #6f8090; display: block; font-size: 13px; line-height: 1.6; }
    button { min-height: 38px; padding: 0 18px; border: 0; border-radius: 9px; color: #fff; background: #315f94; font: inherit; font-size: 12px; font-weight: 750; cursor: pointer; }
    :host-context(.theme-dark) .access-denied-card { border-color: #2a4052; background: #142330; box-shadow: 0 18px 50px rgba(0, 0, 0, .25); }
    :host-context(.theme-dark) h1 { color: #eff6fa; }
    :host-context(.theme-dark) small { color: #9eb0be; }
  `],
})
export class AccessDenied {
  openDashboard(): void {
    window.location.replace('http://192.168.29.101:90/dashboard');
  }
}
