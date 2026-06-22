import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { TrackingRecord, User } from '../../core/models';

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
  recentlyAddedServices?: Array<{ id: string; title: string; tradeLane: string; status: string }>;
  recentActivity?: Array<{ id: string; action: string; entityType: string; createdAt: string; user?: { email: string } }>;
}

@Component({
  selector: 'eg-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Admin Dashboard</p>
          <h1>Users, statistics, audit logs, and tracking oversight.</h1>
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

      <section class="dashboard-grid">
        <form class="tool-panel" (ngSubmit)="createUser()">
          <h2>Create user</h2>
          <input name="name" [(ngModel)]="userForm.name" placeholder="Name" required>
          <input name="email" [(ngModel)]="userForm.email" placeholder="Email" type="email" required>
          <input name="password" [(ngModel)]="userForm.password" placeholder="Password" type="password" required>
          <select name="role" [(ngModel)]="userForm.role">
            <option value="OPERATOR">Operator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit">Create user</button>
        </form>

        <article class="tool-panel">
          <h2>Users</h2>
          @for (user of users; track user.id) {
            <div class="queue-item">
              <strong>{{ user.name }}</strong>
              <span>{{ user.email }} · {{ user.role }} · {{ user.active ? 'Active' : 'Inactive' }}</span>
            </div>
          }
        </article>

        <article class="tool-panel">
          <h2>Recent operator activity</h2>
          @for (activity of stats.recentActivity || []; track activity.id) {
            <div class="queue-item">
              <strong>{{ activity.action }}</strong>
              <span>{{ activity.entityType }} · {{ activity.user?.email || 'System' }}</span>
            </div>
          }
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="tool-panel wide">
          <h2>Recently added services</h2>
          <div class="table-shell compact-table">
            <table>
              <thead>
                <tr><th>Title</th><th>Trade lane</th><th>Status</th></tr>
              </thead>
              <tbody>
                @for (service of stats.recentlyAddedServices || []; track service.id) {
                  <tr><td>{{ service.title }}</td><td>{{ service.tradeLane }}</td><td>{{ service.status }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </article>

        <article class="tool-panel">
          <h2>Tracking dashboard</h2>
          @for (record of trackingRecords; track record.id) {
            <div class="queue-item">
              <strong>{{ record.trackingNumber }}</strong>
              <span>{{ record.currentStatus }} · {{ record.published ? 'Published' : 'Private' }}</span>
            </div>
          }
        </article>
      </section>
    </section>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {};
  users: User[] = [];
  trackingRecords: TrackingRecord[] = [];
  private refreshSubscription?: Subscription;
  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR' as 'OPERATOR' | 'ADMIN'
  };

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
    this.api.trackingRecords().subscribe((records) => (this.trackingRecords = records));
  }

  createUser() {
    this.api.createUser(this.userForm).subscribe(() => {
      this.userForm = { name: '', email: '', password: '', role: 'OPERATOR' };
      this.api.users().subscribe((users) => (this.users = users));
    });
  }
}
