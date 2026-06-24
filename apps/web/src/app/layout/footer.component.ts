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
        <a routerLink="/services/containers">Sea Freight</a>
        <a routerLink="/services/inland-transportation">Domestic Transportation</a>
        <a routerLink="/services/inland-transportation">International Transportation</a>
        <a routerLink="/services/customs-solutions">Customs Support & Solutions</a>
      </section>
      <section>
        <h3>Quick Links</h3>
        <a routerLink="/tracking">Tracking</a>
        <a routerLink="/login" [queryParams]="{ returnUrl: '/contact', intent: 'quote' }">Request a quote</a>
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
