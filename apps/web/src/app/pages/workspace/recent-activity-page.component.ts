import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';

interface DashboardStats {
  recentActivity?: Array<{ id: string; action: string; entityType: string; createdAt: string; user?: { email: string } }>;
}

@Component({
  selector: 'eg-recent-activity-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Recent Activity</p>
          <h1>Audit trail highlights from operator and admin work.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <article class="tool-panel">
        @for (activity of stats.recentActivity || []; track activity.id) {
          <div class="queue-item">
            <strong>{{ activity.action }}</strong>
            <span>{{ activity.entityType }} / {{ activity.user?.email || 'System' }} / {{ activity.createdAt | date: 'medium' }}</span>
          </div>
        } @empty {
          <p>No activity yet.</p>
        }
      </article>
    </section>
  `
})
export class RecentActivityPageComponent implements OnInit, OnDestroy {
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
