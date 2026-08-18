import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SalesDataService } from './sales-data.service';
@Component({
  selector: 'app-sales-export',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sales-export.html',
})
export class SalesExport implements OnInit {
  readonly store = inject(SalesDataService);
  readonly status = signal<'All' | 'Clean' | 'Blocked'>('All');
  readonly format = signal<'Xlsx' | 'Csv'>('Xlsx');
  readonly fromDate = signal('');
  readonly toDate = signal('');
  readonly message = signal('');
  readonly error = signal('');
  readonly exporting = signal(false);
  async ngOnInit() {
    try {
      await this.store.load({ page: 1, pageSize: 1 });
    } catch {}
  }
  async export() {
    const from = this.parse(this.fromDate()),
      to = this.parse(this.toDate());
    if ((this.fromDate() && !from) || (this.toDate() && !to)) {
      this.error.set('Use dd-MM-yyyy date format');
      return;
    }
    if (!this.store.total()) {
      this.error.set('There are no backend records to export');
      return;
    }
    this.exporting.set(true);
    this.error.set('');
    try {
      const blob = await firstValueFrom(
          this.store.export(
            { recordType: this.status(), fromDate: from, toDate: to },
            this.format(),
          ),
        ),
        url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = `sales-leads.${this.format() === 'Csv' ? 'csv' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
      this.message.set('Backend export downloaded');
      setTimeout(() => this.message.set(''), 3000);
    } catch (e) {
      const x = e as { message?: string };
      this.error.set(x.message || 'Export failed');
    } finally {
      this.exporting.set(false);
    }
  }
  private parse(value: string) {
    if (!value) return undefined;
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
    if (!m) return undefined;
    return `${m[3]}-${m[2]}-${m[1]}`;
  }
}
