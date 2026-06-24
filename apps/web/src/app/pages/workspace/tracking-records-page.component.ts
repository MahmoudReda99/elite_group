import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { TrackingRecord, TrackingStatus } from '../../core/models';

type TrackingForm = Omit<TrackingRecord, 'id' | 'events'>;

@Component({
  selector: 'eg-tracking-records-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Tracking Records</p>
          <h1>Create and review internal shipment tracking records.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <section class="dashboard-grid">
        <form class="tool-panel" (ngSubmit)="createTracking()">
          <h2>Create tracking record</h2>
          <input name="trackingNumber" [(ngModel)]="trackingForm.trackingNumber" placeholder="Tracking number" required>
          <input name="customerName" [(ngModel)]="trackingForm.customerName" placeholder="Customer name" required>
          <input name="trackOrigin" [(ngModel)]="trackingForm.originPort" placeholder="Origin port" required>
          <input name="trackDestination" [(ngModel)]="trackingForm.destinationPort" placeholder="Destination port" required>
          <input name="trackVessel" [(ngModel)]="trackingForm.vesselName" placeholder="Vessel name">
          <input name="trackVoyage" [(ngModel)]="trackingForm.voyageNumber" placeholder="Voyage number">
          <select name="currentStatus" [(ngModel)]="trackingForm.currentStatus">
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
          <label class="checkbox"><input name="published" type="checkbox" [(ngModel)]="trackingForm.published"> Published</label>
          <button type="submit">Create tracking</button>
        </form>

        <article class="tool-panel wide">
          <h2>Tracking records</h2>
          <div class="table-shell compact-table">
            <table>
              <thead>
                <tr><th>Tracking</th><th>Route</th><th>Status</th><th>Published</th></tr>
              </thead>
              <tbody>
                @for (record of trackingRecords; track record.id) {
                  <tr>
                    <td><strong>{{ record.trackingNumber }}</strong><small>{{ record.customerName }}</small></td>
                    <td>{{ record.originPort }} -> {{ record.destinationPort }}<small>{{ record.vesselName || '-' }} / {{ record.voyageNumber || '-' }}</small></td>
                    <td>{{ record.currentStatus }}</td>
                    <td>{{ record.published ? 'Yes' : 'No' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="empty">No tracking records yet.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>
  `
})
export class TrackingRecordsPageComponent implements OnInit, OnDestroy {
  trackingRecords: TrackingRecord[] = [];
  statuses: TrackingStatus[] = [
    'BOOKING_RECEIVED',
    'VESSEL_SCHEDULED',
    'DEPARTED',
    'TRANSSHIPMENT',
    'ARRIVED',
    'CUSTOMS_CLEARANCE',
    'DELIVERED'
  ];
  trackingForm: TrackingForm = this.emptyTrackingForm();
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
    this.api.trackingRecords().subscribe((records) => (this.trackingRecords = records));
  }

  createTracking() {
    this.api.createTrackingRecord(this.trackingForm).subscribe(() => {
      this.trackingForm = this.emptyTrackingForm();
      this.load();
    });
  }

  private emptyTrackingForm(): TrackingForm {
    return {
      trackingNumber: '',
      customerName: '',
      originPort: '',
      destinationPort: '',
      vesselName: '',
      voyageNumber: '',
      currentStatus: 'BOOKING_RECEIVED' as TrackingStatus,
      published: false
    };
  }
}
