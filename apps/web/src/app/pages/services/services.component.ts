import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTAINER_CATEGORIES } from './container-catalog-ui';

@Component({
  selector: 'eg-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Services</p>
      <h1>Container equipment, inland transportation, and customs support for practical freight operations.</h1>
    </section>

    <section class="section brief-section">
      <p class="eyebrow">What We Offer</p>
      <h2>Elite Group helps shippers choose the right equipment, move cargo across the Middle East, and handle port or airport work with clear operational support.</h2>
    </section>

    <section class="section offering-section">
      <div class="offering-grid">
        <a routerLink="/services/containers" class="service-offering">
          <img class="service-offering-image" src="assets/images/services/container-dry-cargo.png" alt="Container equipment">
          <h2>Containers</h2>
          <p>Dry, reefer, special, open top, flat rack, platform, and tank equipment details.</p>
          <strong>Learn more</strong>
        </a>
        <a routerLink="/services/inland-transportation" class="service-offering">
          <img class="service-offering-image" src="assets/images/services/truck-fleet-middle-east.png" alt="Inland transportation fleet">
          <h2>Inland Transportation</h2>
          <p>Truck planning across the Middle East for containers, general cargo, and project cargo.</p>
          <strong>Learn more</strong>
        </a>
        <a routerLink="/services/customs-solutions" class="service-offering">
          <img class="service-offering-image" src="assets/images/services/port-air-customs-solutions.png" alt="Port and airport operations">
          <h2>Customs Support & Solutions</h2>
          <p>Port, airport, documentation, clearance, inspection, and issue-resolution support.</p>
          <strong>Learn more</strong>
        </a>
      </div>
    </section>

    <section class="section muted container-overview-section">
      <div class="container-section-title">
        <h2>Our Containers</h2>
        <span></span>
        <p>We provide a mix of container types to suit cargo planning requirements, with clear information for dimensions, openings, weight, and capacity.</p>
      </div>
      <div class="container-category-grid">
        @for (category of categories; track category.slug) {
          <a class="container-category-card" [routerLink]="['/services/containers', category.slug]">
            <img class="container-card-image" [src]="category.image" [alt]="category.name">
            <h3>{{ category.name }}</h3>
            <strong>Learn more</strong>
          </a>
        }
      </div>
    </section>
  `
})
export class ServicesComponent {
  readonly categories = CONTAINER_CATEGORIES;
}
