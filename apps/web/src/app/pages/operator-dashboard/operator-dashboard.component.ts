import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import {
  ContactMessage,
  ContainerType,
  FreightService,
  FreightStatus,
  QuoteRequest,
  TrackingRecord,
  TrackingStatus
} from '../../core/models';

type ServiceForm = Omit<
  FreightService,
  'id' | 'createdAt' | 'updatedAt' | 'oceanFreight' | 'thc'
> & {
  oceanFreight: number | string;
  thc: number | string;
};

type TrackingForm = Omit<TrackingRecord, 'id' | 'events'>;

@Component({
  selector: 'eg-operator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Operator Dashboard</p>
          <h1>Freight services, monthly schedules, quote intake, and tracking.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <section class="dashboard-grid">
        <form class="tool-panel wide" (ngSubmit)="saveService()">
          <h2>{{ editingServiceId ? 'Edit freight service' : 'Create freight service' }}</h2>
          <div class="form-grid">
            <input name="title" [(ngModel)]="serviceForm.title" placeholder="Service title" required>
            <input name="tradeLane" [(ngModel)]="serviceForm.tradeLane" placeholder="Trade lane" required>
            <input name="originCountry" [(ngModel)]="serviceForm.originCountry" placeholder="Origin country" required>
            <input name="originPort" [(ngModel)]="serviceForm.originPort" placeholder="Origin port" required>
            <input name="destinationCountry" [(ngModel)]="serviceForm.destinationCountry" placeholder="Destination country" required>
            <input name="destinationPort" [(ngModel)]="serviceForm.destinationPort" placeholder="Destination port" required>
            <input name="cargoType" [(ngModel)]="serviceForm.cargoType" placeholder="Cargo type" required>
            <select name="containerType" [(ngModel)]="serviceForm.containerType" required>
              <option value="" disabled>Select container type</option>
              @for (container of containers; track container.id) {
                <option [value]="container.name">{{ container.name }}</option>
              }
            </select>
            <input name="vesselName" [(ngModel)]="serviceForm.vesselName" placeholder="Vessel name" required>
            <input name="voyageNumber" [(ngModel)]="serviceForm.voyageNumber" placeholder="Voyage number" required>
            <label>ETD<input name="etd" [(ngModel)]="serviceForm.etd" type="date" required></label>
            <label>ETA<input name="eta" [(ngModel)]="serviceForm.eta" type="date" required></label>
            <label>Month<input name="scheduleMonth" [(ngModel)]="serviceForm.scheduleMonth" type="month" required></label>
            <label>Valid from<input name="validFrom" [(ngModel)]="serviceForm.validFrom" type="date" required></label>
            <label>Valid to<input name="validTo" [(ngModel)]="serviceForm.validTo" type="date" required></label>
            <input name="oceanFreight" [(ngModel)]="serviceForm.oceanFreight" type="number" min="0" placeholder="Ocean freight" required>
            <input name="thc" [(ngModel)]="serviceForm.thc" type="number" min="0" placeholder="THC" required>
            <input name="currency" [(ngModel)]="serviceForm.currency" placeholder="Currency" required>
          </div>
          <textarea name="freeTimeNotes" [(ngModel)]="serviceForm.freeTimeNotes" placeholder="Free time / demurrage notes"></textarea>
          <textarea name="remarks" [(ngModel)]="serviceForm.remarks" placeholder="Remarks"></textarea>
          <div class="row-actions">
            <label class="select-label">
              Status
              <select name="status" [(ngModel)]="serviceForm.status">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
            <button type="submit">{{ editingServiceId ? 'Update service' : 'Create service' }}</button>
            @if (editingServiceId) {
              <button type="button" class="subtle" (click)="resetServiceForm()">Cancel edit</button>
            }
          </div>
        </form>

        <form class="tool-panel" (ngSubmit)="createTracking()">
          <h2>Create tracking record</h2>
          <input name="trackingNumber" [(ngModel)]="trackingForm.trackingNumber" placeholder="Tracking number" required>
          <input name="customerName" [(ngModel)]="trackingForm.customerName" placeholder="Customer name" required>
          <input name="trackOrigin" [(ngModel)]="trackingForm.originPort" placeholder="Origin port" required>
          <input name="trackDestination" [(ngModel)]="trackingForm.destinationPort" placeholder="Destination port" required>
          <input name="trackVessel" [(ngModel)]="trackingForm.vesselName" placeholder="Vessel name">
          <input name="trackVoyage" [(ngModel)]="trackingForm.voyageNumber" placeholder="Voyage number">
          <select name="currentStatus" [(ngModel)]="trackingForm.currentStatus">
            <option value="BOOKING_RECEIVED">Booking received</option>
            <option value="VESSEL_SCHEDULED">Vessel scheduled</option>
            <option value="DEPARTED">Departed</option>
            <option value="TRANSSHIPMENT">Transshipment</option>
            <option value="ARRIVED">Arrived</option>
            <option value="CUSTOMS_CLEARANCE">Customs clearance</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <label class="checkbox"><input name="published" type="checkbox" [(ngModel)]="trackingForm.published"> Published</label>
          <button type="submit">Create tracking</button>
        </form>
      </section>

      <section class="section dashboard-section">
        <div class="section-title">
          <p class="eyebrow">Monthly Schedule Board</p>
          <h2>Filter by month, destination, cargo type, and container type.</h2>
        </div>
        <form class="filter-bar" (ngSubmit)="loadServices()">
          <input name="month" [(ngModel)]="filters.month" type="month">
          <input name="destination" [(ngModel)]="filters.destination" placeholder="Destination">
          <input name="cargoType" [(ngModel)]="filters.cargoType" placeholder="Cargo type">
          <select name="containerType" [(ngModel)]="filters.containerType">
            <option value="">All container types</option>
            @for (container of containers; track container.id) {
              <option [value]="container.name">{{ container.name }}</option>
            }
          </select>
          <button type="submit">Apply</button>
        </form>
        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Route</th>
                <th>Schedule</th>
                <th>Rates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (service of services; track service.id) {
                <tr>
                  <td><strong>{{ service.title }}</strong><small>{{ service.cargoType }} · {{ service.containerType }}</small></td>
                  <td>{{ service.originPort }} → {{ service.destinationPort }}<small>{{ service.tradeLane }}</small></td>
                  <td>{{ service.scheduleMonth }}<small>{{ service.vesselName }} / {{ service.voyageNumber }}</small></td>
                  <td>{{ service.oceanFreight }} {{ service.currency }}<small>THC {{ service.thc }} {{ service.currency }}</small></td>
                  <td><span class="pill" [class.live]="service.status === 'PUBLISHED'">{{ service.status }}</span></td>
                  <td class="actions-cell">
                    <button type="button" (click)="editService(service)">Edit</button>
                    <button type="button" (click)="publishService(service)">Publish</button>
                    <button type="button" class="subtle" (click)="archiveService(service)">Archive</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="dashboard-grid">
        <article class="tool-panel">
          <h2>Quote requests</h2>
          @for (quote of quotes; track quote.id) {
            <div class="queue-item">
              <strong>{{ quote.originPort }} → {{ quote.destinationPort }}</strong>
              <span>{{ quote.name }} · {{ quote.cargoType }} · {{ quote.status }}</span>
            </div>
          } @empty {
            <p>No quote requests yet.</p>
          }
        </article>
        <article class="tool-panel">
          <h2>Contact messages</h2>
          @for (message of contacts; track message.id) {
            <div class="queue-item">
              <strong>{{ message.name }}</strong>
              <span>{{ message.email }} · {{ message.status }}</span>
            </div>
          } @empty {
            <p>No contact messages yet.</p>
          }
        </article>
        <article class="tool-panel">
          <h2>Tracking dashboard</h2>
          @for (record of trackingRecords; track record.id) {
            <div class="queue-item">
              <strong>{{ record.trackingNumber }}</strong>
              <span>{{ record.originPort }} → {{ record.destinationPort }} · {{ record.currentStatus }}</span>
            </div>
          } @empty {
            <p>No tracking records yet.</p>
          }
        </article>
      </section>
    </section>
  `
})
export class OperatorDashboardComponent implements OnInit {
  services: FreightService[] = [];
  quotes: QuoteRequest[] = [];
  contacts: ContactMessage[] = [];
  trackingRecords: TrackingRecord[] = [];
  containers: ContainerType[] = [];
  filters = { month: '', destination: '', cargoType: '', containerType: '' };
  editingServiceId = '';
  serviceForm: ServiceForm = this.emptyServiceForm();
  trackingForm: TrackingForm = this.emptyTrackingForm();

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loadServices();
    this.api.quotes().subscribe((quotes) => (this.quotes = quotes));
    this.api.contacts().subscribe((contacts) => (this.contacts = contacts));
    this.api.trackingRecords().subscribe((records) => (this.trackingRecords = records));
    this.api.containers().subscribe((containers) => (this.containers = containers));
  }

  loadServices() {
    this.api.freightServices(this.filters).subscribe((services) => (this.services = services));
  }

  saveService() {
    const request = this.editingServiceId
      ? this.api.updateFreightService(this.editingServiceId, this.serviceForm)
      : this.api.createFreightService(this.serviceForm);

    request.subscribe(() => {
      this.resetServiceForm();
      this.loadServices();
    });
  }

  editService(service: FreightService) {
    this.editingServiceId = service.id;
    this.serviceForm = {
      ...service,
      etd: service.etd.slice(0, 10),
      eta: service.eta.slice(0, 10),
      validFrom: service.validFrom.slice(0, 10),
      validTo: service.validTo.slice(0, 10)
    };
  }

  publishService(service: FreightService) {
    this.api.updateFreightService(service.id, { status: 'PUBLISHED' }).subscribe(() => this.loadServices());
  }

  archiveService(service: FreightService) {
    this.api.archiveFreightService(service.id).subscribe(() => this.loadServices());
  }

  createTracking() {
    this.api.createTrackingRecord(this.trackingForm).subscribe(() => {
      this.trackingForm = {
        ...this.emptyTrackingForm()
      };
      this.api.trackingRecords().subscribe((records) => (this.trackingRecords = records));
    });
  }

  resetServiceForm() {
    this.editingServiceId = '';
    this.serviceForm = this.emptyServiceForm();
  }

  private emptyServiceForm(): ServiceForm {
    return {
      title: '',
      originCountry: '',
      originPort: '',
      destinationCountry: '',
      destinationPort: '',
      tradeLane: '',
      cargoType: '',
      containerType: '',
      vesselName: '',
      voyageNumber: '',
      etd: '',
      eta: '',
      scheduleMonth: '',
      validFrom: '',
      validTo: '',
      oceanFreight: 0,
      thc: 0,
      currency: 'USD',
      freeTimeNotes: '',
      remarks: '',
      status: 'DRAFT' as FreightStatus
    };
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
