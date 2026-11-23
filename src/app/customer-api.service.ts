import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthSessionService } from './auth-session.service';
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
  private readonly authSession = inject(AuthSessionService);
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
    return this.http.post<CustomerResponse>(this.base, this.withActor(body));
  }
  update(id: number, body: CustomerRequest) {
    return this.http.put<CustomerResponse>(`${this.base}/${id}`, this.withActor(body));
  }
  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
  import(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('actor', this.authSession.requireUserName());
    return this.http
      .post<unknown>(`${this.base}/import`, form)
      .pipe(map((response) => this.normalizeImportResult(response)));
  }
  template() {
    return this.http.get(`${this.base}/template`, { responseType: 'blob' });
  }
  countries() {
    return this.http.get<CountryOption[]>(`${environment.apiUrl}/countries`);
  }
  private withActor(body: CustomerRequest): CustomerRequest & { actor: string } {
    return { ...body, actor: this.authSession.requireUserName() };
  }
  private normalizeImportResult(response: unknown): CustomerImportResult {
    const source = this.asRecord(response);
    const result = this.asRecord(
      source['data'] ?? source['result'] ?? source['value'] ?? source['response'] ?? source,
    );
    const rejectedSource =
      result['rejectedRecords'] ??
      result['RejectedRecords'] ??
      result['rejectedRows'] ??
      result['RejectedRows'] ??
      result['invalidRecords'] ??
      result['InvalidRecords'] ??
      result['errors'] ??
      [];
    const rejectedRecords = Array.isArray(rejectedSource)
      ? rejectedSource.map((item) => {
          const row = this.asRecord(item);
          const message =
            row['errorMessage'] ??
            row['ErrorMessage'] ??
            row['reason'] ??
            row['Reason'] ??
            row['message'] ??
            row['Message'] ??
            'Validation failed';
          return {
            excelRow: this.toNumber(row['excelRow'] ?? row['ExcelRow'] ?? row['row'] ?? row['Row']),
            companyName: this.toText(row['companyName'] ?? row['CompanyName']),
            customerEmail: this.toText(
              row['customerEmail'] ?? row['CustomerEmail'] ?? row['email'] ?? row['Email'],
            ),
            customerNumber:
              this.toText(
                row['customerNumber'] ??
                  row['CustomerNumber'] ??
                  row['contactNumber'] ??
                  row['ContactNumber'],
              ) || null,
            errorMessage: Array.isArray(message)
              ? message.map((value) => String(value)).join(', ')
              : String(message),
          };
        })
      : [];

    return {
      insertedCount: this.toNumber(
        result['insertedCount'] ??
          result['InsertedCount'] ??
          result['importedCount'] ??
          result['ImportedCount'] ??
          result['successCount'] ??
          result['SuccessCount'],
      ),
      rejectedCount: this.toNumber(
        result['rejectedCount'] ??
          result['RejectedCount'] ??
          result['failedCount'] ??
          result['FailedCount'] ??
          result['invalidCount'] ??
          result['InvalidCount'] ??
          rejectedRecords.length,
      ),
      rejectedRecords,
    };
  }
  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
  private toNumber(value: unknown): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }
  private toText(value: unknown): string {
    return value === undefined || value === null ? '' : String(value);
  }
}
