import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { ContainerType, FreightService } from '../../core/models';

@Component({
  selector: 'eg-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Schedules / Freight Services</p>
      <h1>Published vessel schedules and monthly freight rates.</h1>
    </section>

    <section class="section">
      <form class="filter-bar" (ngSubmit)="load()">
        <label>
          Month
          <input type="month" name="month" [(ngModel)]="filters.month">
        </label>
        <label>
          Destination
          <input type="search" name="destination" [(ngModel)]="filters.destination" placeholder="India, Europe, Middle East">
        </label>
        <label>
          Cargo type
          <input type="search" name="cargoType" [(ngModel)]="filters.cargoType" placeholder="Reefer, Special, DG">
        </label>
        <label>
          Container
          <select name="containerType" [(ngModel)]="filters.containerType">
            <option value="">All container types</option>
            @for (container of containers; track container.id) {
              <option [value]="container.name">{{ container.name }}</option>
            }
          </select>
        </label>
        <button type="submit">Filter</button>
      </form>

      <div class="table-shell">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Route</th>
              <th>Vessel</th>
              <th>ETD / ETA</th>
              <th>Validity</th>
              <th>Ocean freight</th>
              <th>THC</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            @for (service of services; track service.id) {
              <tr>
                <td>
                  <strong>{{ service.title }}</strong>
                  <small>{{ service.cargoType }} · {{ service.containerType }}</small>
                </td>
                <td>{{ service.originPort }}, {{ service.originCountry }} → {{ service.destinationPort }}, {{ service.destinationCountry }}</td>
                <td>{{ service.vesselName }}<small>{{ service.voyageNumber }}</small></td>
                <td>{{ service.etd | date:'mediumDate' }}<small>{{ service.eta | date:'mediumDate' }}</small></td>
                <td>{{ service.scheduleMonth }}<small>{{ service.validFrom | date:'mediumDate' }} - {{ service.validTo | date:'mediumDate' }}</small></td>
                <td>{{ service.oceanFreight }} {{ service.currency }}</td>
                <td>{{ service.thc }} {{ service.currency }}</td>
                <td>{{ service.freeTimeNotes || service.remarks || 'Subject to space and equipment availability.' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty">No published services match these filters.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class SchedulesComponent implements OnInit, OnDestroy {
  services: FreightService[] = [];
  containers: ContainerType[] = [];
  private refreshSubscription?: Subscription;
  filters = {
    month: '',
    destination: '',
    cargoType: '',
    containerType: ''
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
    this.api.containers().subscribe((containers) => (this.containers = containers));
    this.api.publicFreightServices(this.filters).subscribe((services) => {
      this.services = services;
    });
  }
}
