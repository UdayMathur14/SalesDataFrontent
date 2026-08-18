import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
export type LeadState = 'Clean' | 'Blocked';
export type SalesLead = {
  id: number;
  recordType: LeadState;
  customerCode: string | null;
  companyName: string | null;
  contactPerson: string | null;
  customerContactNumber1: string | null;
  customerContactNumber2: string | null;
  customerContactNumber3: string | null;
  customerEmail: string | null;
  emailDomain: string | null;
  countryCode: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  category: string | null;
  createdBy: string | null;
  createdOn: string | null;
  salesPersonId: number | null;
  blockedBy: string | null;
  blockReason: string | null;
  released: string | null;
  releasedBy: string | null;
  releasedOn: string | null;
  eventName: string | null;
};
export type SalesSearchResult = {
  cleanItems: SalesLead[];
  blockedItems: SalesLead[];
  cleanTotalCount: number;
  blockedTotalCount: number;
  page: number;
  pageSize: number;
};
export type SalesImportResult = {
  cleanCount: number;
  blockedCount: number;
  invalidCount: number;
  cleanRecords: SalesLead[];
  blockedRecords: SalesLead[];
  invalidRecords: {
    excelRow: number;
    companyName: string;
    customerEmail: string;
    customerNumber: string | null;
    errorMessage: string;
  }[];
};
export type CompanyLocation = {
  companyName: string;
  module: string;
  status: string;
  handledBy: string | null;
};
export type FilterOptions = { categories: string[]; events: string[]; users: string[] };
export type SalesFilters = {
  search?: string;
  category?: string;
  event?: string;
  userName?: string;
  selectedDate?: string;
  fromDate?: string;
  toDate?: string;
  recordType?: 'All' | 'Clean' | 'Blocked';
  page?: number;
  pageSize?: number;
};
@Injectable({ providedIn: 'root' })
export class SalesDataService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sales`;
  readonly cleanItems = signal<SalesLead[]>([]);
  readonly blockedItems = signal<SalesLead[]>([]);
  readonly cleanTotal = signal(0);
  readonly blockedTotal = signal(0);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly leads = computed(() => [...this.cleanItems(), ...this.blockedItems()]);
  readonly total = computed(() => this.cleanTotal() + this.blockedTotal());
  readonly clean = computed(() => this.cleanTotal());
  readonly blocked = computed(() => this.blockedTotal());
  async load(filters: SalesFilters = {}) {
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await firstValueFrom(
        this.http.get<SalesSearchResult>(this.base, { params: this.params(filters) }),
      );
      const clean = result.cleanItems.map((item) => ({ ...item, recordType: 'Clean' as const }));
      const blocked = result.blockedItems.map((item) => ({ ...item, recordType: 'Blocked' as const }));
      this.cleanItems.set(clean);
      this.blockedItems.set(blocked);
      this.cleanTotal.set(result.cleanTotalCount);
      this.blockedTotal.set(result.blockedTotalCount);
      return { ...result, cleanItems: clean, blockedItems: blocked };
    } catch (e) {
      this.error.set(this.problem(e));
      throw e;
    } finally {
      this.loading.set(false);
    }
  }
  import(file: File, mode: 'Standard' | 'Event', eventName?: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('actor', environment.actor);
    form.append('mode', mode);
    if (eventName) form.append('eventName', eventName);
    return this.http.post<SalesImportResult>(`${this.base}/import`, form);
  }
  template(mode: 'Standard' | 'Event') {
    return this.http.get(`${this.base}/templates/${mode}`, { responseType: 'blob' });
  }
  export(filters: SalesFilters, format: 'Xlsx' | 'Csv') {
    return this.http.get(`${this.base}/export`, {
      params: this.params({ ...filters, format }),
      responseType: 'blob',
    });
  }
  verify(companyName: string) {
    return this.http.get<CompanyLocation[]>(`${this.base}/verify-company`, {
      params: { companyName },
    });
  }
  filterOptions() {
    return this.http.get<FilterOptions>(`${this.base}/filter-options`);
  }
  private params(value: Record<string, unknown>) {
    let p = new HttpParams();
    Object.entries(value).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return p;
  }
  private problem(e: unknown) {
    const x = e as { error?: { detail?: string; title?: string } | string; message?: string };
    return typeof x.error === 'string'
      ? x.error
      : x.error?.detail || x.error?.title || x.message || 'Unable to connect to the API.';
  }
}
