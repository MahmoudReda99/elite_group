import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTAINER_CATEGORIES } from '../services/container-catalog-ui';

@Component({
  selector: 'eg-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero" style="background-image: linear-gradient(90deg, rgba(5, 30, 52, .92), rgba(5, 30, 52, .58), rgba(5, 30, 52, .16)), url('assets/images/elite-hero-vessel.png');">
      <div class="hero-content">
        <p class="eyebrow">Freight forwarding &middot; Ocean freight &middot; Inland logistics</p>
        <h1>Elite Group</h1>
        <p class="hero-copy">Container equipment, inland transportation, and customs support across the Middle East.</p>
        <div class="actions">
          <a routerLink="/contact" class="primary">Request a quote</a>
        </div>
      </div>
    </section>

    <section class="section brief-section">
      <p class="eyebrow">Our Company</p>
      <h2>Operational freight support for containers, inland movement, and customs coordination.</h2>
      <p>Elite Group helps shippers select the right equipment, coordinate cargo movement, and keep port, airport, and inland operations clear from booking to delivery.</p>
    </section>

    <section class="section">
      <div class="section-title">
        <p class="eyebrow">Why Choose Elite Group</p>
        <h2>Built for freight teams that need dependable execution.</h2>
      </div>
      <div class="feature-grid">
        <article>
          <span>01</span>
          <h3>Clear equipment planning</h3>
          <p>Container dimensions, openings, payload, and capacity are easy to review before cargo planning starts.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Middle East inland reach</h3>
          <p>Truck coordination supports container, general, reefer, tank, and special cargo movements.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Port and airport support</h3>
          <p>Customs, documentation, inspections, terminal follow-up, and cargo handoff stay connected.</p>
        </article>
      </div>
    </section>

    <section class="section container-overview-section">
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
export class HomeComponent {
  readonly categories = CONTAINER_CATEGORIES;
}
