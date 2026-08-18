import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CompanyLocation, SalesDataService } from './sales-data.service';
@Component({
  selector: 'app-sales-find',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-find.html',
})
export class SalesFind {
  readonly store = inject(SalesDataService);
  readonly searched = signal(false);
  readonly query = signal('');
  readonly results = signal<CompanyLocation[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  async find(v: string) {
    const q = v.trim();
    if (!q) return;
    this.query.set(q);
    this.loading.set(true);
    this.error.set('');
    try {
      this.results.set(await firstValueFrom(this.store.verify(q)));
      this.searched.set(true);
    } catch (e) {
      const x = e as { error?: { detail?: string; title?: string }; message?: string };
      this.error.set(x.error?.detail || x.error?.title || x.message || 'Verification failed');
    } finally {
      this.loading.set(false);
    }
  }
  clear() {
    this.query.set('');
    this.results.set([]);
    this.searched.set(false);
    this.error.set('');
  }
}
