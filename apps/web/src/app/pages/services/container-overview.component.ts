import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTAINER_CATEGORIES } from './container-catalog-ui';

@Component({
  selector: 'eg-container-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="section container-overview-section standalone">
      <div class="container-section-title">
        <h1>Our Containers</h1>
        <span></span>
        <p>
          We provide a mix of container types to suit any cargo you want to ship. With a modern container
          planning approach and a strong focus on practical solutions, we help you choose the better container for your cargo.
        </p>
      </div>

      <div class="container-category-grid">
        @for (category of categories; track category.slug) {
          <a class="container-category-card" [routerLink]="['/services/containers', category.slug]">
            <img class="container-card-image" [src]="category.image" [alt]="category.name">
            <h2>{{ category.name }}</h2>
            <strong>Learn more</strong>
          </a>
        }
      </div>
    </section>
  `
})
export class ContainerOverviewComponent {
  readonly categories = CONTAINER_CATEGORIES;
}
