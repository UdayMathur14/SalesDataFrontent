import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../environments/environment';
export type CustomerResponse = {
  id: number;
  customerCode: string | null;
  companyName: string;
  customerEmail: string;
  emailDomain: string | null;
  contactPerson: string;
  customerContactNumber1: string | null;
  customerContactNumber2: string | null;
  customerContactNumber3: string | null;
  countryCode: string;
  country: string;
  state: string | null;
  city: string | null;
  category: string | null;
  createdBy: string | null;
  createdOn: string | null;
  modifiedBy: string | null;
  modifiedOn: string | null;
};
export type CustomerRequest = {
  customerCode: string;
  companyName: string;
  customerEmail: string;
  contactPerson: string;
  customerContactNumber1: string | null;
  customerContactNumber2: string | null;
  customerContactNumber3: string | null;
  countryCode: string;
  country: string;
  state: string | null;
  city: string | null;
  category: string;
  actor: string;
};
export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
export type CountryOption = { id: number; countryName: string; countryCode: string };
export type CustomerImportResult = {
  insertedCount: number;
  rejectedCount: number;
  rejectedRecords: {
    excelRow: number;
    companyName: string;
    customerEmail: string;
    customerNumber: string | null;
    errorMessage: string;
  }[];
};
@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/customers`;
  search(query: {
    search?: string;
    category?: string;
    country?: string;
    page?: number;
    pageSize?: number;
  }) {
    let p = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<PagedResult<CustomerResponse>>(this.base, { params: p });
  }
  create(body: CustomerRequest) {
    return this.http.post<CustomerResponse>(this.base, body);
  }
  update(id: number, body: CustomerRequest) {
    return this.http.put<CustomerResponse>(`${this.base}/${id}`, body);
  }
  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  import(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('actor', environment.actor);
    return this.http.post<CustomerImportResult>(`${this.base}/import`, form);
  }
  template() {
    return this.http.get(`${this.base}/template`, { responseType: 'blob' });
  }
  countries() {
    return this.http.get<CountryOption[]>(`${environment.apiUrl}/countries`);
  }
}
