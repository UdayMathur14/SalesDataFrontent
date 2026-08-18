import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from '../environments/environment';
import {
  CountryOption,
  CustomerApiService,
  CustomerRequest,
  CustomerResponse,
} from './customer-api.service';
type CustomerView = {
  id: number;
  code: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  phone2: string;
  phone3: string;
  countryCode: string;
  country: string;
  state: string;
  city: string;
  category: string;
  createdBy: string;
  createdOn: string | null;
};
@Component({
  selector: 'app-customer-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-master.html',
})
export class CustomerMaster implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CustomerApiService);
  readonly Math = Math;
  readonly customers = signal<CustomerView[]>([]);
  readonly totalCount = signal(0);
  readonly search = signal('');
  readonly category = signal('');
  readonly country = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly totalPages = signal(1);
  readonly drawerOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly selected = signal<number[]>([]);
  readonly toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  readonly loading = signal(false);
  readonly apiError = signal('');
  readonly countries = signal<CountryOption[]>([]);
  readonly categories = ['CORPORATE', 'LAWFIRM', 'LAW FIRM', 'UNIVERSITY', 'PCT', 'INDIVIDUAL'];
  readonly paged = computed(() => this.customers());
  readonly filtered = computed(() => this.customers());
  readonly countryCount = computed(
    () =>
      new Set(
        this.customers()
          .map((x) => x.country)
          .filter(Boolean),
      ).size,
  );
  readonly completeCount = computed(
    () => this.customers().filter((x) => x.email && x.phone && x.country).length,
  );
  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const length = Math.min(5, total);
    const start = Math.max(1, Math.min(current - 2, total - length + 1));

    return Array.from({ length }, (_, index) => start + index);
  });
  readonly form = this.fb.group({
    code: [''],
    company: ['', [Validators.required, Validators.minLength(2)]],
    contact: ['', Validators.required],
    countryCode: ['+91', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
    phone2: ['', Validators.pattern(/^[0-9]*$/)],
    phone3: ['', Validators.pattern(/^[0-9]*$/)],
    email: ['', [Validators.required, Validators.email]],
    country: ['', Validators.required],
    state: [''],
    city: [''],
    category: ['CORPORATE', Validators.required],
  });
  async ngOnInit() {
    await this.load().catch(() => undefined);
    await this.loadCountries();
  }
  async load() {
    this.loading.set(true);
    this.apiError.set('');
    try {
      const r = await firstValueFrom(
        this.api.search({
          search: this.search(),
          category: this.category(),
          country: this.country(),
          page: this.page(),
          pageSize: this.pageSize(),
        }),
      );
      this.customers.set(r.items.map((x) => this.map(x)));
      this.totalCount.set(r.totalCount);
      this.totalPages.set(r.totalPages || 1);
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading.set(false);
    }
  }
  async loadCountries() {
    try {
      this.countries.set(await firstValueFrom(this.api.countries()));
    } catch {}
  }
  setSearch(v: string) {
    this.search.set(v);
    this.page.set(1);
    void this.load();
  }
  setCategory(v: string) {
    this.category.set(v);
    this.page.set(1);
    void this.load();
  }
  setCountry(v: string) {
    this.country.set(v);
    this.page.set(1);
    void this.load();
  }
  setPage(v: number) {
    this.page.set(Math.min(Math.max(v, 1), this.totalPages()));
    void this.load();
  }
  openCreate() {
    this.editingId.set(null);
    this.form.reset({
      code: `CUST-${Date.now().toString().slice(-8)}`,
      countryCode: '+91',
      country: '',
      category: 'CORPORATE',
    });
    this.drawerOpen.set(true);
  }
  openEdit(c: CustomerView) {
    this.editingId.set(c.id);
    this.form.patchValue(c);
    this.drawerOpen.set(true);
  }
  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message('Please complete the required fields.', 'error');
      return;
    }
    const request = this.request(),
      id = this.editingId();
    try {
      if (id) await firstValueFrom(this.api.update(id, request));
      else await firstValueFrom(this.api.create(request));
      this.drawerOpen.set(false);
      this.message(
        id ? 'Customer updated successfully.' : 'Customer created successfully.',
        'success',
      );
      await this.load();
    } catch (e) {
      this.fail(e);
    }
  }
  toggleSelect(id: number) {
    this.selected.update((x) => (x.includes(id) ? x.filter((v) => v !== id) : [...x, id]));
  }
  togglePage() {
    const ids = this.paged().map((c) => c.id),
      all = ids.every((id) => this.selected().includes(id));
    this.selected.update((s) =>
      all ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])],
    );
  }
  async deleteSelected() {
    const ids = this.selected();
    if (
      !ids.length ||
      !confirm(`Delete ${ids.length} selected customer${ids.length > 1 ? 's' : ''}?`)
    )
      return;
    try {
      await Promise.all(ids.map((id) => firstValueFrom(this.api.delete(id))));
      this.selected.set([]);
      this.message(`${ids.length} customer${ids.length > 1 ? 's' : ''} removed.`, 'success');
      await this.load();
    } catch (e) {
      this.fail(e);
    }
  }
  async downloadTemplate() {
    try {
      const blob = await firstValueFrom(this.api.template());
      this.download(blob, 'CustomerTemplate.xlsx');
      this.message('Backend template downloaded.', 'success');
    } catch (e) {
      this.fail(e);
    }
  }
  exportCustomers() {
    const d = this.customers().map((c) => ({
      'Customer Code': c.code,
      'Company Name': c.company,
      'Contact Person': c.contact,
      Email: c.email,
      'Country Code': c.countryCode,
      'Contact Number': c.phone,
      Country: c.country,
      State: c.state,
      City: c.city,
      Category: c.category,
      'Created By': c.createdBy,
      'Created On': this.date(c.createdOn),
    }));
    if (!d.length) {
      this.message('There are no loaded customer records to export.', 'error');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(d),
      wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'customer-master-current-page.xlsx');
    this.message(`${d.length} loaded records exported.`, 'success');
  }
  async importExcel(e: Event) {
    const input = e.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    try {
      const result = await firstValueFrom(this.api.import(file));
      this.message(
        `${result.insertedCount} imported, ${result.rejectedCount} rejected.`,
        'success',
      );
      await this.load();
    } catch (err) {
      this.fail(err);
    } finally {
      input.value = '';
    }
  }
  private request(): CustomerRequest {
    const v = this.form.getRawValue();
    return {
      customerCode: v.code || `CUST-${Date.now().toString().slice(-8)}`,
      companyName: v.company!,
      customerEmail: v.email!,
      contactPerson: v.contact!,
      customerContactNumber1: v.phone || null,
      customerContactNumber2: v.phone2 || null,
      customerContactNumber3: v.phone3 || null,
      countryCode: v.countryCode!,
      country: v.country!,
      state: v.state || null,
      city: v.city || null,
      category: v.category!,
      actor: environment.actor,
    };
  }
  private map(x: CustomerResponse): CustomerView {
    return {
      id: x.id,
      code: x.customerCode || '',
      company: x.companyName,
      contact: x.contactPerson,
      email: x.customerEmail,
      phone: x.customerContactNumber1 || '',
      phone2: x.customerContactNumber2 || '',
      phone3: x.customerContactNumber3 || '',
      countryCode: x.countryCode,
      country: x.country,
      state: x.state || '',
      city: x.city || '',
      category: x.category || '',
      createdBy: x.createdBy || '',
      createdOn: x.createdOn,
    };
  }
  private date(value: string | null) {
    if (!value) return '';
    const d = new Date(value);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
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
    const text =
      typeof x.error === 'string'
        ? x.error
        : x.error?.detail || x.error?.title || x.message || 'Unable to connect to the API.';
    this.apiError.set(text);
    this.message(text, 'error');
  }
  private message(text: string, type: 'success' | 'error') {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
