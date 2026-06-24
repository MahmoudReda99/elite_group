import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { CompanyProfile } from '../../core/models';

@Component({
  selector: 'eg-company-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Company Profile</p>
          <h1>Current public company contact information.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      @if (profile) {
        <article class="tool-panel company-profile-panel">
          <h2>{{ profile.name }}</h2>
          <p>{{ profile.description || 'No description.' }}</p>
          <div class="metric-row"><span>Email</span><strong>{{ profile.email }}</strong></div>
          <div class="metric-row"><span>Phone</span><strong>{{ profile.phone }}</strong></div>
          <div class="metric-row"><span>Address</span><strong>{{ profile.address }}</strong></div>
          <div class="metric-row"><span>Status</span><strong>{{ profile.active ? 'Active' : 'Inactive' }}</strong></div>
        </article>
      } @else {
        <article class="tool-panel"><p>No company profile loaded.</p></article>
      }
    </section>
  `
})
export class CompanyProfilePageComponent implements OnInit, OnDestroy {
  profile: CompanyProfile | null = null;
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
    this.api.companyProfile().subscribe((profile) => (this.profile = profile));
  }
}
