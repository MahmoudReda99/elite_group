import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { QuoteRequest } from '../../core/models';

@Component({
  selector: 'eg-quote-requests-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Quote Requests</p>
          <h1>Review customer quote intake.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <article class="table-shell">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Customer</th>
              <th>Cargo</th>
              <th>Ready date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (quote of quotes; track quote.id) {
              <tr>
                <td><strong>{{ quote.originPort }} -> {{ quote.destinationPort }}</strong><small>{{ quote.message || 'No notes' }}</small></td>
                <td>{{ quote.name }}<small>{{ quote.email }}{{ quote.phone ? ' / ' + quote.phone : '' }}</small></td>
                <td>{{ quote.cargoType }}<small>{{ quote.containerType }}{{ quote.company ? ' / ' + quote.company : '' }}</small></td>
                <td>{{ quote.readyDate ? (quote.readyDate | date: 'mediumDate') : '-' }}</td>
                <td><span class="pill">{{ quote.status }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty">No quote requests yet.</td></tr>
            }
          </tbody>
        </table>
      </article>
    </section>
  `
})
export class QuoteRequestsPageComponent implements OnInit, OnDestroy {
  quotes: QuoteRequest[] = [];
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
    this.api.quotes().subscribe((quotes) => (this.quotes = quotes));
  }
}
