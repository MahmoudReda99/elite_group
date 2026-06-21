import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'eg-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero" style="background-image: linear-gradient(90deg, rgba(5, 30, 52, .92), rgba(5, 30, 52, .58), rgba(5, 30, 52, .16)), url('assets/images/elite-hero-vessel.png');">
      <div class="hero-content">
        <p class="eyebrow">Freight forwarding · Ocean freight · Inland logistics</p>
        <h1>Elite Group</h1>
        <p class="hero-copy">Freight forwarding, ocean freight, container solutions, and inland services across the Middle East.</p>
        <div class="actions">
          <a routerLink="/schedules" class="primary">View schedules</a>
          <a routerLink="/contact" class="secondary">Request a quote</a>
        </div>
      </div>
    </section>

    <section class="section split">
      <div>
        <p class="eyebrow">Our Company</p>
        <h2>Operational freight support with clear rates, schedules, and accountability.</h2>
      </div>
      <p>Elite Group coordinates containerized cargo across ocean and inland networks, supporting shippers with vessel schedules, route planning, customs coordination, and shipment visibility from booking to delivery.</p>
    </section>

    <section class="section">
      <div class="section-title">
        <p class="eyebrow">Why Choose Elite Group</p>
        <h2>Built for freight teams that need dependable execution.</h2>
      </div>
      <div class="feature-grid">
        <article>
          <span>01</span>
          <h3>Published rates and validity</h3>
          <p>Monthly ocean freight and THC rates are tied to clear validity windows so customers see current information.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Container expertise</h3>
          <p>Support for dry, reefer, open top, flat rack, and special equipment cargo requirements.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Middle East inland reach</h3>
          <p>Coordinated port, truck, and documentation support across key regional trade lanes.</p>
        </article>
      </div>
    </section>

    <section class="section media-band">
      <img src="assets/images/elite-logo.jpeg" alt="Elite Group shipping logistics logo">
      <div>
        <p class="eyebrow">Vessels · Cargo · Containers</p>
        <h2>From ocean schedules to inland delivery, the platform keeps operations visible.</h2>
        <a routerLink="/tracking" class="text-link">Track a shipment</a>
      </div>
    </section>
  `
})
export class HomeComponent {}
