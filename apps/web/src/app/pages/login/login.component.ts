import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'eg-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-hero compact">
      <p class="eyebrow">Secure Access</p>
      <h1>Operator and admin login.</h1>
    </section>

    <section class="section auth-layout">
      <form class="tool-panel login-panel" (ngSubmit)="login()">
        <label>
          Email
          <input type="email" name="email" [(ngModel)]="email" required>
        </label>
        <label>
          Password
          <input type="password" name="password" [(ngModel)]="password" required>
        </label>
        <button type="submit">Login</button>
        @if (error) {
          <p class="form-error">{{ error }}</p>
        }
        <p class="hint">Demo: admin&#64;elitegroup.local or operator&#64;elitegroup.local · Elite&#64;2026!</p>
      </form>
    </section>
  `
})
export class LoginComponent {
  email = 'admin@elitegroup.local';
  password = 'Elite@2026!';
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  login() {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => void this.router.navigateByUrl(this.auth.dashboardUrl()),
      error: () => (this.error = 'Login failed. Check credentials and active status.')
    });
  }
}
