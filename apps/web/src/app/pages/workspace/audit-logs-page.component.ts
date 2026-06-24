import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';

type AuditLog = Record<string, unknown> & { id?: string; action?: string; entityType?: string; createdAt?: string };

@Component({
  selector: 'eg-audit-logs-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Audit Logs</p>
          <h1>Review recorded system actions.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <article class="table-shell">
        <table>
          <thead>
            <tr><th>Action</th><th>Entity</th><th>User</th><th>Created</th></tr>
          </thead>
          <tbody>
            @for (log of logs; track log.id || log.action) {
              <tr>
                <td>{{ log.action || '-' }}</td>
                <td>{{ log.entityType || '-' }}<small>{{ log['entityId'] || '' }}</small></td>
                <td>{{ userEmail(log) }}</td>
                <td>{{ log.createdAt ? (log.createdAt | date: 'medium') : '-' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty">No audit logs loaded.</td></tr>
            }
          </tbody>
        </table>
      </article>
    </section>
  `
})
export class AuditLogsPageComponent implements OnInit, OnDestroy {
  logs: AuditLog[] = [];
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
    this.api.auditLogs().subscribe((logs) => (this.logs = logs as AuditLog[]));
  }

  userEmail(log: AuditLog) {
    const user = log['user'];
    if (user && typeof user === 'object' && 'email' in user) {
      return String(user.email);
    }
    return String(log['userId'] || 'System');
  }
}
