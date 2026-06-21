import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { TrackingRecord, TrackingStatus } from '../../core/models';

@Component({
  selector: 'eg-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Tracking</p>
      <h1>Search a published Elite Group tracking reference.</h1>
    </section>

    <section class="section tracking-layout">
      <form class="tool-panel" (ngSubmit)="search()">
        <label>
          Tracking reference
          <input name="trackingNumber" [(ngModel)]="trackingNumber" placeholder="ELT-2026-0001">
        </label>
        <button type="submit">Search</button>
        @if (error) {
          <p class="form-error">{{ error }}</p>
        }
      </form>

      @if (record) {
        <article class="tracking-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Current Status</p>
              <h2>{{ label(record.currentStatus) }}</h2>
            </div>
            <strong>{{ record.trackingNumber }}</strong>
          </div>
          <dl class="details">
            <div><dt>Customer</dt><dd>{{ record.customerName }}</dd></div>
            <div><dt>Route</dt><dd>{{ record.originPort }} → {{ record.destinationPort }}</dd></div>
            <div><dt>Vessel</dt><dd>{{ record.vesselName || 'Pending' }} {{ record.voyageNumber || '' }}</dd></div>
          </dl>
          <ol class="timeline">
            @for (event of record.events; track event.id) {
              <li>
                <strong>{{ label(event.status) }}</strong>
                <span>{{ event.location }} · {{ event.eventDate | date:'mediumDate' }}</span>
                @if (event.notes) {
                  <p>{{ event.notes }}</p>
                }
              </li>
            }
          </ol>
        </article>
      }
    </section>
  `
})
export class TrackingComponent {
  trackingNumber = 'ELT-2026-0001';
  record: TrackingRecord | null = null;
  error = '';

  constructor(private readonly api: ApiService) {}

  search() {
    this.error = '';
    this.record = null;
    this.api.trackingLookup(this.trackingNumber.trim()).subscribe({
      next: (record) => (this.record = record),
      error: () => (this.error = 'No published tracking record found for this reference.')
    });
  }

  label(status: TrackingStatus) {
    return status
      .toLowerCase()
      .split('_')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }
}
