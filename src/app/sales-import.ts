import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SalesDataService, SalesImportResult } from './sales-data.service';
@Component({
  selector: 'app-sales-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-import.html',
})
export class SalesImport {
  readonly store = inject(SalesDataService);
  readonly mode = signal<'Standard' | 'Event'>('Standard');
  readonly file = signal<File | null>(null);
  readonly message = signal('');
  readonly error = signal('');
  readonly uploading = signal(false);
  readonly result = signal<SalesImportResult | null>(null);
  eventName = '';
  chooseFile(e: Event) {
    this.file.set((e.target as HTMLInputElement).files?.[0] || null);
  }
  async downloadTemplate() {
    try {
      const blob = await firstValueFrom(this.store.template(this.mode()));
      this.download(blob, this.mode() === 'Event' ? 'EventTemplate.xlsx' : 'SalesTemplate.xlsx');
      this.notify('Backend template downloaded');
    } catch (e) {
      this.fail(e);
    }
  }
  async upload() {
    const file = this.file();
    if (!file || (this.mode() === 'Event' && !this.eventName.trim())) {
      this.error.set(
        this.mode() === 'Event'
          ? 'Add an event name and choose an Excel file'
          : 'Choose an Excel file',
      );
      return;
    }
    this.uploading.set(true);
    this.error.set('');
    try {
      const result = await firstValueFrom(
        this.store.import(file, this.mode(), this.eventName.trim() || undefined),
      );
      this.result.set(result);
      this.file.set(null);
      this.eventName = '';
      await this.store.load({ page: 1, pageSize: 50 });
      this.notify(`${result.cleanCount + result.blockedCount} records saved by the backend`);
    } catch (e) {
      this.fail(e);
    } finally {
      this.uploading.set(false);
    }
  }
  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  private fail(e: unknown) {
    const x = e as { error?: { detail?: string; title?: string } | string; message?: string };
    this.error.set(
      typeof x.error === 'string'
        ? x.error
        : x.error?.detail || x.error?.title || x.message || 'API request failed',
    );
  }
  private notify(v: string) {
    this.message.set(v);
    setTimeout(() => this.message.set(''), 3200);
  }
}
