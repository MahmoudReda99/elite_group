import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { User } from '../../core/models';

interface GroupCount {
  _count?: { _all: number };
  destinationCountry?: string;
  cargoType?: string;
  scheduleMonth?: string;
}

interface DashboardStats {
  activeServices?: number;
  trackingRecords?: number;
  openQuotes?: number;
  servicesByDestination?: GroupCount[];
  servicesByCargoType?: GroupCount[];
  monthlySchedules?: GroupCount[];
  recentActivity?: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    createdAt: string;
    user?: { name?: string; email: string; role?: string };
  }>;
}

interface ChartRow {
  label: string;
  value: number;
}

@Component({
  selector: 'eg-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="admin-page admin-dashboard">
      <nav class="admin-breadcrumb" aria-label="Breadcrumb">
        <a routerLink="/admin/overview">Dashboard</a>
        <span>Overview</span>
      </nav>

      <header class="admin-page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin User! Here's what's happening with your logistics operations.</p>
        </div>
        <div class="admin-toolbar">
          <button class="date-range-button" type="button">
            <span class="calendar-mini-icon" aria-hidden="true"></span>
            <span>{{ dateRangeLabel() }}</span>
            <span class="select-chevron" aria-hidden="true"></span>
          </button>
          <button class="primary-action refresh-action" type="button" (click)="load()">
            <span class="refresh-mini-icon" aria-hidden="true"></span>
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <section class="kpi-grid" aria-label="Dashboard metrics">
        @for (card of kpiCards(); track card.label) {
          <article class="kpi-card" [ngClass]="card.tone">
            <span class="kpi-icon" [ngClass]="card.icon" aria-hidden="true"></span>
            <div>
              <p>{{ card.label }}</p>
              <strong>{{ card.value }}</strong>
              <small>{{ card.note }}</small>
            </div>
          </article>
        }
      </section>

      <section class="dashboard-reference-grid">
        <article class="reference-panel destination-panel">
          <div class="panel-head">
            <h2>
              <span class="panel-title-icon destination-title-icon" aria-hidden="true"></span>
              Services by destination
            </h2>
            <a routerLink="/admin/statistics">View all</a>
          </div>

          <div class="bar-chart">
            @for (row of destinationRows(); track row.label) {
              <div class="bar-row">
                <span>{{ row.label }}</span>
                <div class="bar-track">
                  <span [style.width.%]="barWidth(row.value, destinationMax())"></span>
                </div>
                <strong>{{ row.value }}</strong>
              </div>
            } @empty {
              <p class="empty">No destination data yet.</p>
            }
          </div>
        </article>

        <article class="reference-panel cargo-panel">
          <div class="panel-head">
            <h2>
              <span class="panel-title-icon cargo-title-icon" aria-hidden="true"></span>
              Services by cargo type
            </h2>
            <a routerLink="/admin/statistics">View all</a>
          </div>

          <div class="cargo-chart-layout">
            <div class="cargo-donut" [style.background]="cargoGradient()">
              <span>
                <strong>{{ totalCargo() }}</strong>
                <small>Total</small>
              </span>
            </div>
            <div class="cargo-legend">
              @for (row of cargoRows(); track row.label; let index = $index) {
                <div>
                  <span class="legend-dot" [style.background]="cargoColor(index)"></span>
                  <strong>{{ row.label }}</strong>
                  <small>{{ row.value }} ({{ percentage(row.value, totalCargo()) }}%)</small>
                </div>
              } @empty {
                <p class="empty">No cargo type data yet.</p>
              }
            </div>
          </div>
        </article>

        <article class="reference-panel users-panel">
          <div class="panel-head">
            <h2>
              <span class="panel-title-icon users-title-icon" aria-hidden="true"></span>
              Users
            </h2>
            <a routerLink="/admin/users">View all</a>
          </div>

          <div class="user-list">
            @for (user of users.slice(0, 5); track user.id) {
              <div class="user-row">
                <span class="user-avatar">{{ initials(user.name || user.email) }}</span>
                <span class="user-copy">
                  <strong>{{ user.name || user.email }}</strong>
                  <small>{{ user.email }}</small>
                </span>
                <span class="role-badge" [ngClass]="roleClass(user.role)">{{ user.role }}</span>
              </div>
            } @empty {
              <p class="empty">No users loaded.</p>
            }
          </div>
        </article>
      </section>

      <article class="reference-panel activity-panel">
        <div class="panel-head">
          <h2>
            <span class="panel-title-icon activity-title-icon" aria-hidden="true"></span>
            Recent operator activity
          </h2>
          <a routerLink="/admin/recent-activity">View all</a>
        </div>

        <div class="table-shell reference-table-shell">
          <table class="reference-table activity-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>User</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              @for (activity of activityRows(); track activity.id) {
                <tr>
                  <td>
                    <span class="activity-action-icon" aria-hidden="true"></span>
                    {{ actionLabel(activity.action) }}
                  </td>
                  <td>{{ activity.entityId || activity.entityType }}</td>
                  <td>{{ activity.user?.name || activity.user?.email || 'System' }}</td>
                  <td>{{ formatDateTime(activity.createdAt) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="empty">No activity yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `
})
export class AdminOverviewComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {};
  users: User[] = [];
  private refreshSubscription?: Subscription;
  private readonly cargoPalette = ['#122d67', '#e4ac2d', '#70c1aa', '#8798c3', '#9aa4b4'];

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
    this.api.users().subscribe((users) => (this.users = users));
  }

  kpiCards() {
    return [
      {
        label: 'Active services',
        value: this.stats.activeServices || 0,
        note: 'Live published services',
        icon: 'kpi-ship-icon',
        tone: 'kpi-blue'
      },
      {
        label: 'Tracking records',
        value: this.stats.trackingRecords || 0,
        note: 'Live tracking records',
        icon: 'kpi-pin-icon',
        tone: 'kpi-green'
      },
      {
        label: 'Open quote requests',
        value: this.stats.openQuotes || 0,
        note: 'Awaiting operator action',
        icon: 'kpi-doc-icon',
        tone: 'kpi-gold'
      },
      {
        label: 'Schedules this month',
        value: this.schedulesThisMonth(),
        note: 'Current month departures',
        icon: 'kpi-schedule-icon',
        tone: 'kpi-soft-blue'
      }
    ];
  }

  dateRangeLabel() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return `${this.shortMonth(start)} 1 - ${this.shortMonth(today)} ${today.getDate()}, ${today.getFullYear()}`;
  }

  destinationRows(): ChartRow[] {
    return (this.stats.servicesByDestination || [])
      .map((item) => ({
        label: item.destinationCountry || 'Unknown',
        value: item._count?._all || 0
      }))
      .sort((first, second) => second.value - first.value)
      .slice(0, 6);
  }

  destinationMax() {
    return Math.max(...this.destinationRows().map((row) => row.value), 1);
  }

  cargoRows(): ChartRow[] {
    return (this.stats.servicesByCargoType || [])
      .map((item) => ({
        label: item.cargoType || 'Others',
        value: item._count?._all || 0
      }))
      .sort((first, second) => second.value - first.value)
      .slice(0, 5);
  }

  totalCargo() {
    return this.cargoRows().reduce((total, row) => total + row.value, 0);
  }

  cargoGradient() {
    const rows = this.cargoRows();
    const total = this.totalCargo();

    if (!rows.length || !total) {
      return 'conic-gradient(#e8edf4 0deg 360deg)';
    }

    let start = 0;
    const stops = rows.map((row, index) => {
      const degrees = (row.value / total) * 360;
      const stop = `${this.cargoColor(index)} ${start}deg ${start + degrees}deg`;
      start += degrees;
      return stop;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  cargoColor(index: number) {
    return this.cargoPalette[index % this.cargoPalette.length];
  }

  percentage(value: number, total: number) {
    if (!total) {
      return '0.0';
    }

    return ((value / total) * 100).toFixed(1);
  }

  barWidth(value: number, max: number) {
    return Math.max((value / max) * 100, 8);
  }

  activityRows() {
    return (this.stats.recentActivity || []).slice(0, 5);
  }

  initials(value?: string) {
    if (!value) {
      return 'EG';
    }

    return value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  roleClass(role?: string) {
    return role === 'ADMIN' ? 'admin-role' : 'operator-role';
  }

  actionLabel(action: string) {
    return action.replaceAll('_', ' ').toLowerCase();
  }

  formatDateTime(value?: string) {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  private schedulesThisMonth() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return (
      this.stats.monthlySchedules?.find((item) => item.scheduleMonth === monthKey)?._count?._all ||
      0
    );
  }

  private shortMonth(date: Date) {
    return new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  }
}
