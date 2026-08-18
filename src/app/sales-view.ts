import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FilterOptions, LeadState, SalesDataService } from './sales-data.service';
@Component({
  selector: 'app-sales-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sales-view.html',
})
export class SalesView implements OnInit {
  readonly store = inject(SalesDataService);
  readonly query = signal('');
  readonly category = signal('');
  readonly owner = signal('');
  readonly event = signal('');
  readonly fromDate = signal('');
  readonly toDate = signal('');
  readonly tab = signal<'All' | LeadState>('All');
  readonly options = signal<FilterOptions>({ categories: [], events: [], users: [] });
  readonly dateError = signal('');
  async ngOnInit() {
    try {
      await this.store.load({ page: 1, pageSize: 50 });
      const options = await firstValueFrom(this.store.filterOptions());
      this.options.set(options);
    } catch {}
  }
  async search() {
    const from = this.parse(this.fromDate()),
      to = this.parse(this.toDate());
    if ((this.fromDate() && !from) || (this.toDate() && !to)) {
      this.dateError.set('Use dd-MM-yyyy date format');
      return;
    }
    this.dateError.set('');
    try {
      await this.store.load({
        search: this.query(),
        category: this.category(),
        event: this.event(),
        userName: this.owner(),
        fromDate: from,
        toDate: to,
        recordType: this.tab(),
        page: 1,
        pageSize: 50,
      });
    } catch {}
  }
  async setTab(value: 'All' | LeadState) {
    this.tab.set(value);
    await this.search();
  }
  reset() {
    this.query.set('');
    this.category.set('');
    this.owner.set('');
    this.event.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.tab.set('All');
    void this.search();
  }
  private parse(value: string) {
    if (!value) return undefined;
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
    if (!m) return undefined;
    const [, d, mo, y] = m,
      date = new Date(Number(y), Number(mo) - 1, Number(d));
    return date.getFullYear() === Number(y) &&
      date.getMonth() === Number(mo) - 1 &&
      date.getDate() === Number(d)
      ? `${y}-${mo}-${d}`
      : undefined;
  }
}
