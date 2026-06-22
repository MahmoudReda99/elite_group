import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'eg-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <a routerLink="/" class="brand" aria-label="Elite Group home">
        <img src="assets/images/elite-logo.jpeg" alt="Elite Group logo">
        <span>
          <strong>Elite Group</strong>
          <small>Shipping &middot; Supply &middot; Solutions</small>
        </span>
      </a>

      <nav aria-label="Primary navigation">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/services" routerLinkActive="active">Services</a>
        <a routerLink="/tracking" routerLinkActive="active">Tracking</a>
        <a routerLink="/contact" routerLinkActive="active">Contact</a>
        @if (user()) {
          <a [routerLink]="dashboardUrl()" routerLinkActive="active">Dashboard</a>
          @if (user()?.role === 'ADMIN') {
            <a routerLink="/admin/database" routerLinkActive="active">Database</a>
          }
          <button class="icon-text subtle" type="button" (click)="logout()" title="Sign out">Sign out</button>
        } @else {
          <a class="button-link" routerLink="/login">Login</a>
        }
      </nav>
    </header>
  `
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.currentUser;
  readonly dashboardUrl = computed(() => this.auth.dashboardUrl());

  logout() {
    this.auth.logout();
  }
}
