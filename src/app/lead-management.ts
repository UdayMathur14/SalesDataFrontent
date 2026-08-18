import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import * as XLSX from 'xlsx';

type LeadState = 'Clean' | 'Blocked' | 'Review';
type Lead = {
  id: number;
  company: string;
  person: string;
  title: string;
  email: string;
  phone: string;
  type: string;
  category: string;
  event: string;
  owner: string;
  city: string;
  state: LeadState;
  score: number;
  created: string;
  activity: string;
};

const LEADS: Lead[] = [
  {
    id: 1,
    company: 'Arclight Systems',
    person: 'Mira Kapoor',
    title: 'VP – Partnerships',
    email: 'mira@arclight.io',
    phone: '+91 98710 23841',
    type: 'Corporate',
    category: 'Technology',
    event: 'SaaS Connect 2026',
    owner: 'Rajnish Singh',
    city: 'Gurugram',
    state: 'Clean',
    score: 92,
    created: '18 Aug, 10:42 AM',
    activity: 'Meeting · Tomorrow',
  },
  {
    id: 2,
    company: 'BluePeak Healthcare',
    person: 'Rohit Menon',
    title: 'Procurement Head',
    email: 'rohit@bluepeak.care',
    phone: '+91 99871 45290',
    type: 'Corporate',
    category: 'Healthcare',
    event: 'HealthTech India',
    owner: 'Neha Kapoor',
    city: 'Mumbai',
    state: 'Clean',
    score: 86,
    created: '18 Aug, 09:18 AM',
    activity: 'Called · 2h ago',
  },
  {
    id: 3,
    company: 'Eleven North Studio',
    person: 'Sana Chawla',
    title: 'Co-founder',
    email: 'sana@elevennorth.co',
    phone: '+91 88002 19748',
    type: 'SMB',
    category: 'Media',
    event: 'Organic Lead',
    owner: 'Rajnish Singh',
    city: 'Delhi',
    state: 'Review',
    score: 68,
    created: '17 Aug, 04:26 PM',
    activity: 'Email sent · 5h',
  },
  {
    id: 4,
    company: 'Kite Education Labs',
    person: 'Aman Srivastava',
    title: 'Business Director',
    email: 'aman@kiteedu.in',
    phone: '+91 98731 67014',
    type: 'Corporate',
    category: 'Education',
    event: 'Edu Leaders Summit',
    owner: 'Amit Joshi',
    city: 'Noida',
    state: 'Clean',
    score: 81,
    created: '17 Aug, 11:05 AM',
    activity: 'Proposal · 1d ago',
  },
  {
    id: 5,
    company: 'RapidReach Marketing',
    person: 'Gaurav Sethi',
    title: 'Sales Executive',
    email: 'info@rapidreach.xyz',
    phone: '+91 70117 99204',
    type: 'Agency',
    category: 'Marketing',
    event: 'CSV Import – Aug',
    owner: 'Neha Kapoor',
    city: 'Jaipur',
    state: 'Blocked',
    score: 24,
    created: '16 Aug, 02:48 PM',
    activity: 'Duplicate domain',
  },
  {
    id: 6,
    company: 'Terra Foods India',
    person: 'Diya Nair',
    title: 'Regional Manager',
    email: 'diya@terrafoods.in',
    phone: '+91 99203 41126',
    type: 'Enterprise',
    category: 'FMCG',
    event: 'Retail Expo 2026',
    owner: 'Rajnish Singh',
    city: 'Pune',
    state: 'Clean',
    score: 89,
    created: '16 Aug, 10:30 AM',
    activity: 'Demo booked · Fri',
  },
  {
    id: 7,
    company: 'NovaGrid Energy',
    person: 'Pranav Batra',
    title: 'Operations Lead',
    email: 'pranav@novagrid.energy',
    phone: '+91 98100 57412',
    type: 'Enterprise',
    category: 'Energy',
    event: 'Energy Forum',
    owner: 'Amit Joshi',
    city: 'Bengaluru',
    state: 'Review',
    score: 72,
    created: '15 Aug, 05:12 PM',
    activity: 'Follow-up · Today',
  },
  {
    id: 8,
    company: 'Orchid Retail Co.',
    person: 'Jaya Arora',
    title: 'Category Manager',
    email: 'jaya@orchidretail.in',
    phone: '+91 97022 81650',
    type: 'SMB',
    category: 'Retail',
    event: 'Retail Expo 2026',
    owner: 'Neha Kapoor',
    city: 'Ahmedabad',
    state: 'Clean',
    score: 78,
    created: '14 Aug, 01:17 PM',
    activity: 'Qualified · 2d ago',
  },
  {
    id: 9,
    company: 'Vertex Consulting',
    person: 'Nikhil Rao',
    title: 'Managing Partner',
    email: 'nikhil@vertexadvisory.co',
    phone: '+91 98991 28042',
    type: 'Agency',
    category: 'Consulting',
    event: 'Organic Lead',
    owner: 'Rajnish Singh',
    city: 'Hyderabad',
    state: 'Blocked',
    score: 31,
    created: '13 Aug, 03:37 PM',
    activity: 'Invalid email',
  },
];

@Component({
  selector: 'app-lead-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-management.html',
  styleUrl: './lead-management.scss',
})
export class LeadManagement {
  readonly leads = signal<Lead[]>(LEADS);
  readonly query = signal('');
  readonly type = signal('All types');
  readonly category = signal('All categories');
  readonly owner = signal('All owners');
  readonly event = signal('All events');
  readonly tab = signal<'All' | LeadState>('All');
  readonly page = signal(1);
  readonly uploadOpen = signal(false);
  readonly toast = signal('');
  readonly verifying = signal(false);
  readonly verifyResult = signal<{ company: string; found: boolean; modules: string[] } | null>(
    null,
  );
  eventName = '';
  eventDate = '';
  eventFile: File | null = null;
  readonly types = ['All types', 'Corporate', 'Enterprise', 'SMB', 'Agency'];
  readonly categories = [
    'All categories',
    'Technology',
    'Healthcare',
    'Education',
    'Media',
    'Marketing',
    'FMCG',
    'Energy',
    'Retail',
    'Consulting',
  ];
  readonly owners = ['All owners', 'Rajnish Singh', 'Neha Kapoor', 'Amit Joshi'];
  readonly events = [
    'All events',
    'SaaS Connect 2026',
    'HealthTech India',
    'Edu Leaders Summit',
    'Retail Expo 2026',
    'Energy Forum',
    'Organic Lead',
    'CSV Import – Aug',
  ];
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.leads().filter(
      (l) =>
        (this.tab() === 'All' || l.state === this.tab()) &&
        (this.type() === 'All types' || l.type === this.type()) &&
        (this.category() === 'All categories' || l.category === this.category()) &&
        (this.owner() === 'All owners' || l.owner === this.owner()) &&
        (this.event() === 'All events' || l.event === this.event()) &&
        (!q || `${l.company} ${l.person} ${l.email} ${l.phone}`.toLowerCase().includes(q)),
    );
  });
  readonly clean = computed(() => this.leads().filter((l) => l.state === 'Clean').length);
  readonly blocked = computed(() => this.leads().filter((l) => l.state === 'Blocked').length);
  readonly review = computed(() => this.leads().filter((l) => l.state === 'Review').length);
  readonly avgScore = computed(() =>
    Math.round(this.leads().reduce((a, l) => a + l.score, 0) / this.leads().length),
  );
  setTab(v: 'All' | LeadState) {
    this.tab.set(v);
    this.page.set(1);
  }
  resetFilters() {
    this.query.set('');
    this.type.set('All types');
    this.category.set('All categories');
    this.owner.set('All owners');
    this.event.set('All events');
    this.tab.set('All');
  }
  verifyCompany(value: string) {
    const company = value.trim();
    if (!company) return;
    this.verifying.set(true);
    this.verifyResult.set(null);
    setTimeout(() => {
      const match = this.leads().some((l) =>
        l.company.toLowerCase().includes(company.toLowerCase()),
      );
      this.verifyResult.set({
        company,
        found: match,
        modules: match ? ['Lead register', 'Campaign activity', 'Event contacts'] : [],
      });
      this.verifying.set(false);
    }, 550);
  }
  downloadTemplate() {
    this.write(
      [
        {
          'Company Name*': 'Acme Pvt Ltd',
          'Contact Person*': 'Aarav Sharma',
          'Job Title': 'Director',
          Email: 'aarav@acme.com',
          Phone: '9876543210',
          Type: 'Corporate',
          Category: 'Technology',
          Event: 'SaaS Connect 2026',
          Owner: 'Rajnish Singh',
          City: 'Delhi',
        },
      ],
      'lead-import-template.xlsx',
      'Lead Template',
    );
    this.message('Lead template downloaded');
  }
  export() {
    const rows = this.filtered().map((l) => ({
      'Company Name': l.company,
      'Contact Person': l.person,
      'Job Title': l.title,
      Email: l.email,
      Phone: l.phone,
      Type: l.type,
      Category: l.category,
      Event: l.event,
      Owner: l.owner,
      City: l.city,
      Status: l.state,
      Score: l.score,
    }));
    this.write(rows, 'lead-register.xlsx', 'Lead Register');
    this.message(`${rows.length} leads exported`);
  }
  importLeads(e: Event) {
    const input = e.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    this.readFile(file, 'Direct Excel import');
    input.value = '';
  }
  chooseEventFile(e: Event) {
    this.eventFile = (e.target as HTMLInputElement).files?.[0] || null;
  }
  uploadEvent() {
    if (!this.eventName.trim() || !this.eventDate || !this.eventFile) {
      this.message('Complete event name, date and Excel file');
      return;
    }
    this.readFile(this.eventFile, this.eventName);
    this.uploadOpen.set(false);
    this.eventName = '';
    this.eventDate = '';
    this.eventFile = null;
  }
  private readFile(file: File, eventName: string) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const wb = XLSX.read(r.result, { type: 'array' }),
          rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]),
          items = rows
            .filter((x) => x['Company Name*'] || x['Company Name'])
            .map((x, i): Lead => ({
              id: Date.now() + i,
              company: x['Company Name*'] || x['Company Name'],
              person: x['Contact Person*'] || x['Contact Person'] || '—',
              title: x['Job Title'] || '—',
              email: x['Email'] || '—',
              phone: String(x['Phone'] || '—'),
              type: x['Type'] || 'Corporate',
              category: x['Category'] || 'Technology',
              event: eventName === 'Direct Excel import' ? x['Event'] || eventName : eventName,
              owner: x['Owner'] || 'Rajnish Singh',
              city: x['City'] || '—',
              state: 'Review',
              score: 65,
              created: 'Just now',
              activity: 'New import',
            }));
        this.leads.update((x) => [...items, ...x]);
        this.message(`${items.length} event contacts uploaded`);
      } catch {
        this.message('This Excel file could not be read');
      }
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
  private message(v: string) {
    this.toast.set(v);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
