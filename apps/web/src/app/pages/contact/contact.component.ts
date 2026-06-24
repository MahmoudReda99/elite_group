import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { CompanyProfile, ContainerType } from '../../core/models';

@Component({
  selector: 'eg-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Contact</p>
      <h1>Talk to Elite Group about freight schedules, rates, and cargo support.</h1>
    </section>

    <section class="section contact-grid">
      <div class="company-card">
        <h2>Company Details</h2>
        @if (companyProfile) {
          <p>{{ companyProfile.name }}</p>
          <p>{{ companyProfile.email }}</p>
          <p>{{ companyProfile.phone }}</p>
          <p>{{ companyProfile.address }}</p>
          @if (companyProfile.description) {
            <p>{{ companyProfile.description }}</p>
          }
        }
      </div>

      <form class="tool-panel" (ngSubmit)="sendContact()">
        <h2>Send a message</h2>
        <input name="name" [(ngModel)]="contact.name" placeholder="Name" required>
        <input name="email" [(ngModel)]="contact.email" placeholder="Email" type="email" required>
        <input name="phone" [(ngModel)]="contact.phone" placeholder="Phone">
        <input name="company" [(ngModel)]="contact.company" placeholder="Company">
        <textarea name="message" [(ngModel)]="contact.message" placeholder="Message" required></textarea>
        <button type="submit">Send</button>
        @if (contactSaved) {
          <p class="form-success">Message received. Our operations team can review it from the dashboard.</p>
        }
      </form>

      <form class="tool-panel quote-panel" (ngSubmit)="sendQuote()">
        <h2>Request a quote</h2>
        @if (!auth.currentUser()) {
          <p class="quote-login-copy">Please log in or sign up before requesting a quote.</p>
          <button type="button" (click)="goToQuoteLogin()">Log in to request quote</button>
        } @else if (auth.currentUser()?.role !== 'CUSTOMER') {
          <p class="form-error">Please use a customer account to request a quote.</p>
        } @else {
          <input name="quoteName" [(ngModel)]="quote.name" placeholder="Name" required>
          <input name="quoteEmail" [(ngModel)]="quote.email" placeholder="Email" type="email" required>
          <input name="quotePhone" [(ngModel)]="quote.phone" placeholder="Phone">
          <input name="quoteCompany" [(ngModel)]="quote.company" placeholder="Company">
          <input name="originPort" [(ngModel)]="quote.originPort" placeholder="Origin port" required>
          <input name="destinationPort" [(ngModel)]="quote.destinationPort" placeholder="Destination port" required>
          <input name="cargoType" [(ngModel)]="quote.cargoType" placeholder="Cargo type" required>
          <select name="containerType" [(ngModel)]="quote.containerType" required>
            <option value="" disabled>Select container type</option>
            @for (container of containers; track container.id) {
              <option [value]="container.name">{{ container.name }}</option>
            }
          </select>
          <input name="readyDate" [(ngModel)]="quote.readyDate" type="date">
          <textarea name="quoteMessage" [(ngModel)]="quote.message" placeholder="Cargo notes"></textarea>
          <button type="submit">Request quote</button>
        }
        @if (quoteSaved) {
          <p class="form-success">Quote request created successfully. You will receive the answer via mail or phone call.</p>
        }
        @if (quoteError) {
          <p class="form-error">{{ quoteError }}</p>
        }
      </form>
    </section>
  `
})
export class ContactComponent implements OnInit, OnDestroy {
  companyProfile?: CompanyProfile;
  containers: ContainerType[] = [];
  private refreshSubscription?: Subscription;
  contact = { name: '', email: '', phone: '', company: '', message: '' };
  quote = {
    name: '',
    email: '',
    phone: '',
    company: '',
    originPort: '',
    destinationPort: '',
    cargoType: '',
    containerType: '',
    readyDate: '',
    message: ''
  };
  contactSaved = false;
  quoteSaved = false;
  quoteError = '';

  constructor(
    private readonly api: ApiService,
    readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadPublicData();
    this.refreshSubscription = interval(LIVE_REFRESH_INTERVAL_MS).subscribe(() => this.loadPublicData());
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private loadPublicData() {
    this.api.companyProfile().subscribe((companyProfile) => {
      this.companyProfile = companyProfile || undefined;
    });
    this.api.containers().subscribe((containers) => (this.containers = containers));
    this.prefillQuoteIdentity();
  }

  goToQuoteLogin() {
    void this.router.navigate(['/login'], { queryParams: { returnUrl: '/contact', intent: 'quote' } });
  }

  sendContact() {
    this.api.contact(this.contact).subscribe(() => {
      this.contactSaved = true;
      this.contact = { name: '', email: '', phone: '', company: '', message: '' };
    });
  }

  sendQuote() {
    const user = this.auth.currentUser();
    this.quoteError = '';

    if (!user) {
      this.goToQuoteLogin();
      return;
    }

    if (user.role !== 'CUSTOMER') {
      this.quoteError = 'Please use a customer account to request a quote.';
      return;
    }

    this.quote.name ||= user.name;
    this.quote.email ||= user.email;

    this.api.quote(this.quote).subscribe(() => {
      this.quoteSaved = true;
      this.quote = {
        name: '',
        email: '',
        phone: '',
        company: '',
        originPort: '',
        destinationPort: '',
        cargoType: '',
        containerType: '',
        readyDate: '',
        message: ''
      };
      this.prefillQuoteIdentity();
    });
  }

  private prefillQuoteIdentity() {
    const user = this.auth.currentUser();
    if (user?.role === 'CUSTOMER') {
      this.quote.name ||= user.name;
      this.quote.email ||= user.email;
    }
  }
}
