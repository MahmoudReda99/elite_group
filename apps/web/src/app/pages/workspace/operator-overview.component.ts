import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { ContactMessage, FreightService, QuoteRequest, TrackingRecord } from '../../core/models';

@Component({
  selector: 'eg-operator-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Operator Overview</p>
          <h1>Freight services, quote intake, contact messages, and tracking.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <section class="stat-grid">
        <article><strong>{{ services.length }}</strong><span>Freight services</span></article>
        <article><strong>{{ quotes.length }}</strong><span>Quote requests</span></article>
        <article><strong>{{ trackingRecords.length }}</strong><span>Tracking records</span></article>
      </section>

      <section class="dashboard-grid">
        <article class="tool-panel">
          <h2>Recent services</h2>
          @for (service of services.slice(0, 5); track service.id) {
            <div class="queue-item"><strong>{{ service.title }}</strong><span>{{ service.tradeLane }} / {{ service.status }}</span></div>
          } @empty {
            <p>No freight services yet.</p>
          }
        </article>
        <article class="tool-panel">
          <h2>Quote requests</h2>
          @for (quote of quotes.slice(0, 5); track quote.id) {
            <div class="queue-item"><strong>{{ quote.originPort }} -> {{ quote.destinationPort }}</strong><span>{{ quote.name }} / {{ quote.status }}</span></div>
          } @empty {
            <p>No quote requests yet.</p>
          }
        </article>
        <article class="tool-panel">
          <h2>Contact messages</h2>
          @for (message of contacts.slice(0, 5); track message.id) {
            <div class="queue-item"><strong>{{ message.name }}</strong><span>{{ message.email }} / {{ message.status }}</span></div>
          } @empty {
            <p>No contact messages yet.</p>
          }
        </article>
      </section>
    </section>
  `
})
export class OperatorOverviewComponent implements OnInit, OnDestroy {
  services: FreightService[] = [];
  quotes: QuoteRequest[] = [];
  contacts: ContactMessage[] = [];
  trackingRecords: TrackingRecord[] = [];
  private refreshSubscription?: Subscription;

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
    this.refreshSubscription = interval(LIVE_REFRESH_INTERVAL_MS).subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  load() {
    this.api.freightServices().subscribe((services) => (this.services = services));
    this.api.quotes().subscribe((quotes) => (this.quotes = quotes));
    this.api.contacts().subscribe((contacts) => (this.contacts = contacts));
    this.api.trackingRecords().subscribe((records) => (this.trackingRecords = records));
  }
}
