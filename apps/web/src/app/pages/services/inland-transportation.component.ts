import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TRANSPORT_TYPES } from './container-catalog-ui';

@Component({
  selector: 'eg-inland-transportation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Inland Transportation</p>
      <h1>Middle East truck planning for containers, general cargo, cold chain, and project freight.</h1>
    </section>

    <section class="section brief-section">
      <p>
        Elite Group coordinates road transportation from ports, airports, warehouses, and customer facilities using
        the truck type that fits the shipment, cargo dimensions, and route limits.
      </p>
    </section>

    <section class="section muted">
      <div class="transport-grid full">
        @for (truck of transportTypes; track truck.name) {
          <article>
            <div class="service-image-shell">
              <img class="service-real-image" [src]="truck.image" [alt]="truck.name" [style.object-position]="truck.imagePosition">
              <!-- @if (truck.brand) {
                <span>Elite Group</span>
              } -->
            </div>
            <h2>{{ truck.name }}</h2>
            <p>{{ truck.summary }}</p>
            <strong>{{ truck.cargo }}</strong>
          </article>
        }
      </div>
    </section>
  `
})
export class InlandTransportationComponent {
  readonly transportTypes = TRANSPORT_TYPES;
}
