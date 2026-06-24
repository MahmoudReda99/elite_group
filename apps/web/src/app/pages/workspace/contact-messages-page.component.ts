import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { ContactMessage } from '../../core/models';

@Component({
  selector: 'eg-contact-messages-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Contact Messages</p>
          <h1>Review customer messages from the public contact form.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <section class="dashboard-grid">
        @for (message of contacts; track message.id) {
          <article class="tool-panel">
            <h2>{{ message.name }}</h2>
            <p>{{ message.message }}</p>
            <div class="metric-row"><span>Email</span><strong>{{ message.email }}</strong></div>
            <div class="metric-row"><span>Phone</span><strong>{{ message.phone || '-' }}</strong></div>
            <div class="metric-row"><span>Status</span><strong>{{ message.status }}</strong></div>
          </article>
        } @empty {
          <article class="tool-panel"><p>No contact messages yet.</p></article>
        }
      </section>
    </section>
  `
})
export class ContactMessagesPageComponent implements OnInit, OnDestroy {
  contacts: ContactMessage[] = [];
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
    this.api.contacts().subscribe((contacts) => (this.contacts = contacts));
  }
}
