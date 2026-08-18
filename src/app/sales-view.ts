import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly options = signal<FilterOptions>({ categories: [], events: [], users: [] });
  readonly dateError = signal('');
  readonly exportOpen = signal(false);
  readonly exportFormat = signal<'Xlsx' | 'Csv'>('Xlsx');
  readonly exporting = signal(false);
  readonly message = signal('');
  readonly visibleLeads = computed(() =>
    this.tab() === 'All'
      ? this.store.leads()
      : this.store.leads().filter((lead) => lead.recordType === this.tab()),
  );
  readonly totalPages = computed(() => {
    const count =
      this.tab() === 'Clean'
        ? this.store.clean()
        : this.tab() === 'Blocked'
          ? this.store.blocked()
          : Math.max(this.store.clean(), this.store.blocked());
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });
  async ngOnInit() {
    try {
      await this.loadCurrent();
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
    this.page.set(1);
    await this.loadCurrent();
  }
  private async loadCurrent() {
    const from = this.parse(this.fromDate()),
      to = this.parse(this.toDate());
    try {
      await this.store.load({
        search: this.query(),
        category: this.category(),
        event: this.event(),
        userName: this.owner(),
        fromDate: from,
        toDate: to,
        recordType: 'All',
        page: this.page(),
        pageSize: this.pageSize(),
      });
    } catch {}
  }
  async setTab(value: 'All' | LeadState) {
    this.tab.set(value);
    this.page.set(1);
    await this.loadCurrent();
  }
  async goToPage(value: number) {
    this.page.set(Math.min(Math.max(1, value), this.totalPages()));
    await this.loadCurrent();
  }
  async changePageSize(value: string) {
    this.pageSize.set(Number(value));
    this.page.set(1);
    await this.loadCurrent();
  }
  reset() {
    this.query.set('');
    this.category.set('');
    this.owner.set('');
    this.event.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.tab.set('All');
    this.page.set(1);
    void this.search();
  }
  async downloadExport(format: 'Xlsx' | 'Csv') {
    const from = this.parse(this.fromDate()),
      to = this.parse(this.toDate());
    if ((this.fromDate() && !from) || (this.toDate() && !to)) {
      this.dateError.set('Use dd-MM-yyyy date format');
      return;
    }
    this.exporting.set(true);
    this.exportFormat.set(format);
    this.dateError.set('');
    try {
      const blob = await firstValueFrom(
        this.store.export(
          {
            search: this.query(),
            category: this.category(),
            event: this.event(),
            userName: this.owner(),
            fromDate: from,
            toDate: to,
            recordType: this.tab(),
          },
          format,
        ),
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-leads.${format === 'Csv' ? 'csv' : 'xlsx'}`;
      link.click();
      URL.revokeObjectURL(url);
      this.exportOpen.set(false);
      this.message.set(`${format === 'Xlsx' ? 'Excel' : 'CSV'} export downloaded`);
      setTimeout(() => this.message.set(''), 3000);
    } catch (e) {
      const error = e as { message?: string };
      this.dateError.set(error.message || 'Export failed');
    } finally {
      this.exporting.set(false);
    }
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
