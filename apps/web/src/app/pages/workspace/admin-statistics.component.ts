import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';

interface GroupCount {
  _count?: { _all: number };
  destinationCountry?: string;
  cargoType?: string;
  scheduleMonth?: string;
  tradeLane?: string;
  _avg?: { oceanFreight: string | number | null };
}

interface DashboardStats {
  activeServices?: number;
  trackingRecords?: number;
  openQuotes?: number;
  servicesByDestination?: GroupCount[];
  servicesByCargoType?: GroupCount[];
  monthlySchedules?: GroupCount[];
  averageOceanFreightByTradeLane?: GroupCount[];
}

@Component({
  selector: 'eg-admin-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Statistics</p>
          <h1>Freight service, schedule, and quote metrics.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <section class="stat-grid">
        <article><strong>{{ stats.activeServices || 0 }}</strong><span>Active services</span></article>
        <article><strong>{{ stats.trackingRecords || 0 }}</strong><span>Tracking records</span></article>
        <article><strong>{{ stats.openQuotes || 0 }}</strong><span>Open quote requests</span></article>
      </section>

      <section class="dashboard-grid">
        <article class="tool-panel">
          <h2>Services by destination</h2>
          @for (item of stats.servicesByDestination || []; track item.destinationCountry) {
            <div class="metric-row"><span>{{ item.destinationCountry }}</span><strong>{{ item._count?._all }}</strong></div>
          }
        </article>
        <article class="tool-panel">
          <h2>Services by cargo type</h2>
          @for (item of stats.servicesByCargoType || []; track item.cargoType) {
            <div class="metric-row"><span>{{ item.cargoType }}</span><strong>{{ item._count?._all }}</strong></div>
          }
        </article>
        <article class="tool-panel">
          <h2>Monthly schedules</h2>
          @for (item of stats.monthlySchedules || []; track item.scheduleMonth) {
            <div class="metric-row"><span>{{ item.scheduleMonth }}</span><strong>{{ item._count?._all }}</strong></div>
          }
        </article>
        <article class="tool-panel">
          <h2>Average ocean freight by lane</h2>
          @for (item of stats.averageOceanFreightByTradeLane || []; track item.tradeLane) {
            <div class="metric-row"><span>{{ item.tradeLane }}</span><strong>{{ item._avg?.oceanFreight || 0 }} USD</strong></div>
          }
        </article>
      </section>
    </section>
  `
})
export class AdminStatisticsComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {};
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
    this.api.adminStats().subscribe((stats) => (this.stats = stats as DashboardStats));
  }
}
