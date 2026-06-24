import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { RegisterCustomerPayload } from '../../core/models';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'eg-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="customer-auth-page" [class.signup-active]="mode === 'signup'">
      @if (mode === 'login') {
        <form class="customer-login-card" (ngSubmit)="login()">
          <h1>Please Log in</h1>

          <label>
            E-mail Address
            <input type="email" name="email" [(ngModel)]="email" required>
          </label>

          <label>
            <span class="label-row">
              Password
              <button class="text-link" type="button">Forgot your password?</button>
            </span>
            <input type="password" name="password" [(ngModel)]="password" required>
          </label>

          <button class="orange-auth-button" type="submit">Log in</button>

          @if (error) {
            <p class="form-error">{{ error }}</p>
          }

          <button class="auth-switch-button" type="button" (click)="showSignup()">Sign up</button>
        </form>
      } @else {
        <section class="customer-register-shell">
          <div class="register-form-panel">
            <h1>Register Account</h1>

            @if (registerStep === 1) {
              <form class="register-form" (ngSubmit)="continueRegistration()">
                <label>
                  First Name
                  <input name="firstName" [(ngModel)]="registerForm.firstName" required>
                </label>
                <label>
                  Last Name
                  <input name="lastName" [(ngModel)]="registerForm.lastName" required>
                </label>
                <label>
                  Country Code
                  <select name="countryCode" [(ngModel)]="registerForm.countryCode" required>
                    <option value="" disabled>Country Code</option>
                    <option value="+20">Egypt +20</option>
                    <option value="+966">Saudi Arabia +966</option>
                    <option value="+971">United Arab Emirates +971</option>
                    <option value="+49">Germany +49</option>
                    <option value="+1">United States +1</option>
                  </select>
                </label>
                <label>
                  Phone Number
                  <input name="phoneNumber" [(ngModel)]="registerForm.phoneNumber" required>
                </label>
                <label>
                  Company Name
                  <input name="companyName" [(ngModel)]="registerForm.companyName" required>
                </label>
                <label>
                  Street Address / Number
                  <input name="streetAddress" [(ngModel)]="registerForm.streetAddress" required>
                </label>
                <label>
                  City
                  <input name="city" [(ngModel)]="registerForm.city" required>
                </label>
                <label>
                  Country / Region
                  <select name="countryRegion" [(ngModel)]="registerForm.countryRegion" required>
                    <option value="" disabled>Country / Region</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Germany">Germany</option>
                    <option value="United States">United States</option>
                  </select>
                </label>

                <button class="orange-auth-button" type="submit">Continue</button>
                <button class="auth-switch-button" type="button" (click)="showLogin()">Cancel</button>
              </form>
            } @else {
              <form class="register-form account-step" (ngSubmit)="register()">
                <label>
                  Gmail Address
                  <input type="email" name="registerEmail" [(ngModel)]="registerForm.email" required>
                </label>
                <label>
                  Password
                  <input type="password" name="registerPassword" [(ngModel)]="registerForm.password" minlength="8" required>
                </label>

                <button class="orange-auth-button" type="submit">Create account</button>
                <button class="auth-switch-button" type="button" (click)="registerStep = 1">Back</button>
              </form>
            }

            @if (error) {
              <p class="form-error">{{ error }}</p>
            }
          </div>
        </section>
      }
    </section>
  `
})
export class LoginComponent {
  mode: AuthMode = 'login';
  registerStep = 1;
  email = '';
  password = '';
  error = '';
  registerForm: RegisterCustomerPayload = this.emptyRegisterForm();

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  login() {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => void this.router.navigateByUrl(this.redirectUrl()),
      error: () => (this.error = 'Login failed. Check your email and password.')
    });
  }

  continueRegistration() {
    this.error = '';
    this.registerStep = 2;
  }

  register() {
    this.error = '';
    this.registerForm.email = this.registerForm.email.toLowerCase();

    if (!this.registerForm.email.endsWith('@gmail.com')) {
      this.error = 'Please use a Gmail address to sign up.';
      return;
    }

    this.auth.registerCustomer(this.registerForm).subscribe({
      next: () => void this.router.navigateByUrl(this.redirectUrl()),
      error: (error) => {
        if (error?.status === 404) {
          this.error = 'Registration API is not available yet. Please restart the API server and run the database migration.';
          return;
        }

        this.error = 'Registration failed. Please check your details and try again.';
      }
    });
  }

  showSignup() {
    this.mode = 'signup';
    this.registerStep = 1;
    this.registerForm = this.emptyRegisterForm();
    this.error = '';
  }

  showLogin() {
    this.mode = 'login';
    this.registerStep = 1;
    this.registerForm = this.emptyRegisterForm();
    this.error = '';
  }

  private redirectUrl() {
    return this.route.snapshot.queryParamMap.get('returnUrl') || this.auth.dashboardUrl();
  }

  private emptyRegisterForm(): RegisterCustomerPayload {
    return {
      firstName: '',
      lastName: '',
      countryCode: '',
      phoneNumber: '',
      companyName: '',
      streetAddress: '',
      city: '',
      countryRegion: '',
      email: '',
      password: ''
    };
  }
}
