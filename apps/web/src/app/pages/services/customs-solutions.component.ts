import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SOLUTIONS } from './container-catalog-ui';

@Component({
  selector: 'eg-customs-solutions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Customs Support & Solutions</p>
      <h1>Operational support for ports, airports, documentation, clearance, and shipment issues.</h1>
    </section>

    <section class="section brief-section">
      <p>
        Elite Group supports jobs related to port and airport cargo movement, from paperwork checks and clearance
        coordination to inspection follow-up, cargo release, warehousing handoff, and urgent problem solving.
      </p>
    </section>

    <section class="section muted">
      <div class="solutions-grid full">
        @for (solution of solutions; track solution.name) {
          <article>
            <div class="service-image-shell">
              <img class="service-real-image" [src]="solution.image" [alt]="solution.name" [style.object-position]="solution.imagePosition">
            </div>
            <h2>{{ solution.name }}</h2>
            <p>{{ solution.summary }}</p>
          </article>
        }
      </div>
    </section>
  `
})
export class CustomsSolutionsComponent {
  readonly solutions = SOLUTIONS;
}
