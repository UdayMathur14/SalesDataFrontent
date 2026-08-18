import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';

type CustomerStatus = 'Active' | 'Inactive';
type Customer = {
  id: number;
  code: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  countryCode: string;
  phone2: string;
  phone3: string;
  country: string;
  state: string;
  city: string;
  category: string;
  status: CustomerStatus;
  createdBy: string;
  createdAt: string;
};
const CUSTOMERS: Customer[] = [
  {
    id: 1,
    code: 'CUS-001',
    company: 'Ganga Crest International',
    contact: 'Ananya Sharma',
    email: 'hello@ganga-crest.com',
    phone: '96907 21128',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Noida',
    category: 'Enterprise',
    status: 'Active',
    createdBy: 'Rajnish Singh',
    createdAt: '12 Aug 2026',
  },
  {
    id: 2,
    code: 'CUS-002',
    company: 'Saurav Bhattacharjee',
    contact: 'Saurav Bhattacharjee',
    email: 'saurav@northstar.in',
    phone: '70029 71922',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Assam',
    city: 'Guwahati',
    category: 'Individual',
    status: 'Active',
    createdBy: 'Rajnish Singh',
    createdAt: '11 Aug 2026',
  },
  {
    id: 3,
    code: 'CUS-003',
    company: 'Antarmayee Healthcare',
    contact: 'Dr. Antarmayee Panigrahi',
    email: 'care@antarmayee.com',
    phone: '70778 92709',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Odisha',
    city: 'Bhubaneswar',
    category: 'Healthcare',
    status: 'Active',
    createdBy: 'Neha Kapoor',
    createdAt: '10 Aug 2026',
  },
  {
    id: 4,
    code: 'CUS-004',
    company: 'BloomRehab Technologies',
    contact: 'Aarav Mehta',
    email: 'accounts@bloomrehab.com',
    phone: '93901 84548',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    category: 'Technology',
    status: 'Active',
    createdBy: 'Rajnish Singh',
    createdAt: '09 Aug 2026',
  },
  {
    id: 5,
    code: 'CUS-005',
    company: 'Univeons EdTech Pvt Ltd',
    contact: 'Ishita Verma',
    email: 'team@univeons.com',
    phone: '81300 30929',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    category: 'Education',
    status: 'Inactive',
    createdBy: 'Amit Joshi',
    createdAt: '08 Aug 2026',
  },
  {
    id: 6,
    code: 'CUS-006',
    company: 'Locanam Ventures',
    contact: 'Uday Sahni',
    email: 'uday@locanam.com',
    phone: '93184 41992',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Haryana',
    city: 'Gurugram',
    category: 'Individual',
    status: 'Active',
    createdBy: 'Rajnish Singh',
    createdAt: '06 Aug 2026',
  },
  {
    id: 7,
    code: 'CUS-007',
    company: 'IILM University Greater Noida',
    contact: 'Vikas Kamra',
    email: 'admissions@iilm.edu',
    phone: '98102 45731',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Greater Noida',
    category: 'Education',
    status: 'Active',
    createdBy: 'Neha Kapoor',
    createdAt: '05 Aug 2026',
  },
  {
    id: 8,
    code: 'CUS-008',
    company: 'Indi Konnect Ventures',
    contact: 'Kabir Arora',
    email: 'hello@indikonnect.in',
    phone: '98990 18421',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    category: 'Enterprise',
    status: 'Active',
    createdBy: 'Amit Joshi',
    createdAt: '03 Aug 2026',
  },
  {
    id: 9,
    code: 'CUS-009',
    company: 'Acumen Digital Labs',
    contact: 'Rhea Bansal',
    email: 'rhea@acumendigital.io',
    phone: '88261 10745',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    category: 'Technology',
    status: 'Inactive',
    createdBy: 'Neha Kapoor',
    createdAt: '01 Aug 2026',
  },
  {
    id: 10,
    code: 'CUS-010',
    company: 'The Wellness Canvas',
    contact: 'Meera Iyer',
    email: 'meera@wellnesscanvas.in',
    phone: '99712 88210',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    category: 'Healthcare',
    status: 'Active',
    createdBy: 'Rajnish Singh',
    createdAt: '30 Jul 2026',
  },
  {
    id: 11,
    code: 'CUS-011',
    company: 'Orbit Retail Solutions',
    contact: 'Arjun Nair',
    email: 'arjun@orbitretail.in',
    phone: '98110 67245',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'Kerala',
    city: 'Kochi',
    category: 'Enterprise',
    status: 'Active',
    createdBy: 'Amit Joshi',
    createdAt: '28 Jul 2026',
  },
  {
    id: 12,
    code: 'CUS-012',
    company: 'Northwind Creative Co.',
    contact: 'Tanya Roy',
    email: 'tanya@northwind.co',
    phone: '98109 11357',
    countryCode: '+91',
    phone2: '',
    phone3: '',
    country: 'India',
    state: 'West Bengal',
    city: 'Kolkata',
    category: 'Individual',
    status: 'Active',
    createdBy: 'Neha Kapoor',
    createdAt: '25 Jul 2026',
  },
];

@Component({
  selector: 'app-customer-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-master.html',
})
export class CustomerMaster {
  private readonly fb = inject(FormBuilder);
  readonly Math = Math;
  readonly customers = signal<Customer[]>(CUSTOMERS);
  readonly search = signal('');
  readonly category = signal('All categories');
  readonly status = signal('All status');
  readonly page = signal(1);
  readonly pageSize = signal(7);
  readonly drawerOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly selected = signal<number[]>([]);
  readonly toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  readonly categories = [
    'All categories',
    'Enterprise',
    'Individual',
    'Healthcare',
    'Technology',
    'Education',
  ];
  readonly countries = [
    'India',
    'United Arab Emirates',
    'Singapore',
    'United Kingdom',
    'United States',
  ];
  readonly form = this.fb.group({
    code: [''],
    company: ['', [Validators.required, Validators.minLength(2)]],
    contact: ['', Validators.required],
    countryCode: ['+91', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9 ]{8,15}$/)]],
    phone2: [''],
    phone3: [''],
    email: ['', [Validators.required, Validators.email]],
    country: ['India', Validators.required],
    state: [''],
    city: [''],
    category: ['Enterprise', Validators.required],
    status: ['Active' as CustomerStatus, Validators.required],
  });
  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.customers().filter(
      (c) =>
        (!q ||
          `${c.company} ${c.contact} ${c.email} ${c.phone} ${c.code}`.toLowerCase().includes(q)) &&
        (this.category() === 'All categories' || c.category === this.category()) &&
        (this.status() === 'All status' || c.status === this.status()),
    );
  });
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize())),
  );
  readonly paged = computed(() =>
    this.filtered().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()),
  );
  readonly activeCount = computed(
    () => this.customers().filter((c) => c.status === 'Active').length,
  );
  readonly enterpriseCount = computed(
    () => this.customers().filter((c) => c.category === 'Enterprise').length,
  );
  setSearch(v: string) {
    this.search.set(v);
    this.page.set(1);
  }
  setCategory(v: string) {
    this.category.set(v);
    this.page.set(1);
  }
  setStatus(v: string) {
    this.status.set(v);
    this.page.set(1);
  }
  setPage(v: number) {
    this.page.set(Math.min(Math.max(v, 1), this.totalPages()));
  }
  openCreate() {
    this.editingId.set(null);
    this.form.reset({
      code: `CUS-${String(this.customers().length + 1).padStart(3, '0')}`,
      countryCode: '+91',
      country: 'India',
      category: 'Enterprise',
      status: 'Active',
    });
    this.drawerOpen.set(true);
  }
  openEdit(c: Customer) {
    this.editingId.set(c.id);
    this.form.patchValue(c);
    this.drawerOpen.set(true);
  }
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message('Please complete the required fields.', 'error');
      return;
    }
    const v = this.form.getRawValue(),
      id = this.editingId();
    if (id) {
      this.customers.update((rows) =>
        rows.map((c) => (c.id === id ? ({ ...c, ...v } as Customer) : c)),
      );
      this.message('Customer details updated successfully.', 'success');
    } else {
      this.customers.update((rows) => [
        {
          ...v,
          id: Date.now(),
          code: v.code || `CUS-${String(rows.length + 1).padStart(3, '0')}`,
          createdBy: 'Rajnish Singh',
          createdAt: 'Just now',
        } as Customer,
        ...rows,
      ]);
      this.message('New customer added to your master.', 'success');
    }
    this.drawerOpen.set(false);
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
  deleteSelected() {
    const n = this.selected().length;
    if (!n || !confirm(`Delete ${n} selected customer${n > 1 ? 's' : ''}?`)) return;
    this.customers.update((rows) => rows.filter((c) => !this.selected().includes(c.id)));
    this.selected.set([]);
    this.message(`${n} customer${n > 1 ? 's' : ''} removed.`, 'success');
  }
  downloadTemplate() {
    this.write(
      [
        {
          'Customer Code': 'CUS-001',
          'Company Name*': 'Acme Pvt Ltd',
          'Contact Person*': 'Aarav Sharma',
          'Country Code*': '+91',
          'Contact Number*': '9876543210',
          Email: 'aarav@acme.com',
          Country: 'India',
          State: 'Delhi',
          City: 'New Delhi',
          Category: 'Enterprise',
          Status: 'Active',
        },
      ],
      'customer-import-template.xlsx',
      'Customer Template',
    );
    this.message('Excel template downloaded.', 'success');
  }
  exportCustomers() {
    const d = this.filtered().map((c) => ({
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
      Status: c.status,
      'Created By': c.createdBy,
    }));
    this.write(d, 'customer-master.xlsx', 'Customers');
    this.message(`${d.length} customer records exported.`, 'success');
  }
  importExcel(e: Event) {
    const input = e.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const wb = XLSX.read(r.result, { type: 'array' }),
          rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]),
          items = rows
            .filter((x) => x['Company Name*'] || x['Company Name'])
            .map((x, i): Customer => ({
              id: Date.now() + i,
              code: x['Customer Code'] || `CUS-${Date.now().toString().slice(-5)}${i}`,
              company: x['Company Name*'] || x['Company Name'],
              contact: x['Contact Person*'] || x['Contact Person'] || '',
              countryCode: x['Country Code*'] || x['Country Code'] || '+91',
              phone: String(x['Contact Number*'] || x['Contact Number'] || ''),
              phone2: '',
              phone3: '',
              email: x['Email'] || '',
              country: x['Country'] || 'India',
              state: x['State'] || '',
              city: x['City'] || '',
              category: x['Category'] || 'Enterprise',
              status: x['Status'] === 'Inactive' ? 'Inactive' : 'Active',
              createdBy: 'Excel import',
              createdAt: 'Just now',
            }));
        this.customers.update((x) => [...items, ...x]);
        this.message(`${items.length} customers imported from Excel.`, 'success');
      } catch {
        this.message('Could not read this Excel file.', 'error');
      }
      input.value = '';
    };
    r.readAsArrayBuffer(file);
  }
  private write(data: object[], name: string, sheet: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet);
    XLSX.writeFile(wb, name);
  }
  private message(text: string, type: 'success' | 'error') {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 3200);
  }
}
