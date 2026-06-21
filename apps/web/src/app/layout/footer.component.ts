import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'eg-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <section>
        <h2>Elite Group</h2>
        <p>Freight forwarding, ocean freight, container solutions, inland services, and logistics support across the Middle East.</p>
      </section>
      <section>
        <h3>Services</h3>
        <a routerLink="/services">Ocean freight</a>
        <a routerLink="/services">Reefer cargo</a>
        <a routerLink="/services">Inland transportation</a>
        <a routerLink="/services">Customs support</a>
      </section>
      <section>
        <h3>Quick Links</h3>
        <a routerLink="/schedules">Schedules</a>
        <a routerLink="/tracking">Tracking</a>
        <a routerLink="/contact">Request a quote</a>
      </section>
      <section>
        <h3>Contact</h3>
        <p>operations&#64;elitegroup.local</p>
        <p>+201115456274</p>
        <p>Middle East logistics desk</p>
      </section>
    </footer>
  `
})
export class FooterComponent {}
