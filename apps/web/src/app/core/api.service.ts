import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './environment';
import {
  ContactMessage,
  CompanyProfile,
  ContainerCatalogItem,
  ContainerType,
  DatabaseRow,
  DatabaseTable,
  FreightService,
  LoginResponse,
  QuoteRequest,
  ServiceCategory,
  TrackingRecord,
  User
} from './models';

type Query = Record<string, string | number | boolean | undefined | null>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  publicFreightServices(query: Query = {}): Observable<FreightService[]> {
    return this.http.get<FreightService[]>(`${this.apiUrl}/public/freight-services`, {
      params: this.toParams(query)
    });
  }

  freightServices(query: Query = {}): Observable<FreightService[]> {
    return this.http.get<FreightService[]>(`${this.apiUrl}/freight-services`, {
      params: this.toParams(query)
    });
  }

  createFreightService(payload: Partial<FreightService>): Observable<FreightService> {
    return this.http.post<FreightService>(`${this.apiUrl}/freight-services`, payload);
  }

  updateFreightService(id: string, payload: Partial<FreightService>): Observable<FreightService> {
    return this.http.patch<FreightService>(`${this.apiUrl}/freight-services/${id}`, payload);
  }

  archiveFreightService(id: string): Observable<FreightService> {
    return this.http.delete<FreightService>(`${this.apiUrl}/freight-services/${id}`);
  }

  containers(): Observable<ContainerType[]> {
    return this.http.get<ContainerType[]>(`${this.apiUrl}/public/container-types`);
  }

  containerCatalog(): Observable<ContainerCatalogItem[]> {
    return this.http.get<ContainerCatalogItem[]>(`${this.apiUrl}/public/container-catalog`);
  }

  containerCatalogItem(slug: string): Observable<ContainerCatalogItem> {
    return this.http.get<ContainerCatalogItem>(`${this.apiUrl}/public/container-catalog/${slug}`);
  }

  categories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/public/service-categories`);
  }

  companyProfile(): Observable<CompanyProfile | null> {
    return this.http.get<CompanyProfile | null>(`${this.apiUrl}/public/company-profile`);
  }

  trackingLookup(trackingNumber: string): Observable<TrackingRecord> {
    return this.http.get<TrackingRecord>(`${this.apiUrl}/public/tracking/${trackingNumber}`);
  }

  trackingRecords(): Observable<TrackingRecord[]> {
    return this.http.get<TrackingRecord[]>(`${this.apiUrl}/tracking`);
  }

  createTrackingRecord(payload: Partial<TrackingRecord>): Observable<TrackingRecord> {
    return this.http.post<TrackingRecord>(`${this.apiUrl}/tracking`, payload);
  }

  contact(payload: Partial<ContactMessage>): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(`${this.apiUrl}/public/contact-messages`, payload);
  }

  contacts(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.apiUrl}/contact-messages`);
  }

  quote(payload: Partial<QuoteRequest>): Observable<QuoteRequest> {
    return this.http.post<QuoteRequest>(`${this.apiUrl}/public/quote-requests`, payload);
  }

  quotes(): Observable<QuoteRequest[]> {
    return this.http.get<QuoteRequest[]>(`${this.apiUrl}/quote-requests`);
  }

  adminStats(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/admin/dashboard/stats`);
  }

  auditLogs(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}/admin/audit-logs`);
  }

  users(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  createUser(payload: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users`, payload);
  }

  databaseTables(): Observable<DatabaseTable[]> {
    return this.http.get<DatabaseTable[]>(`${this.apiUrl}/admin/database/tables`);
  }

  databaseRows(table: string): Observable<DatabaseRow[]> {
    return this.http.get<DatabaseRow[]>(`${this.apiUrl}/admin/database/${table}/rows`);
  }

  createDatabaseRow(table: string, payload: Record<string, unknown>): Observable<DatabaseRow> {
    return this.http.post<DatabaseRow>(`${this.apiUrl}/admin/database/${table}/rows`, payload);
  }

  updateDatabaseRow(table: string, id: string, payload: Record<string, unknown>): Observable<DatabaseRow> {
    return this.http.patch<DatabaseRow>(`${this.apiUrl}/admin/database/${table}/rows/${id}`, payload);
  }

  deleteDatabaseRow(table: string, id: string): Observable<DatabaseRow> {
    return this.http.delete<DatabaseRow>(`${this.apiUrl}/admin/database/${table}/rows/${id}`);
  }

  private toParams(query: Query) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
