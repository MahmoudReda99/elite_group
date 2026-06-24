import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { RegisterCustomerPayload, User } from './models';

const tokenKey = 'elite_group_access_token';
const userKey = 'elite_group_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(this.readUser());

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((response) => this.setSession(response.accessToken, response.user))
    );
  }

  registerCustomer(payload: RegisterCustomerPayload) {
    return this.api.registerCustomer(payload).pipe(
      tap((response) => this.setSession(response.accessToken, response.user))
    );
  }

  logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    this.currentUser.set(null);
    void this.router.navigateByUrl('/');
  }

  token() {
    return localStorage.getItem(tokenKey);
  }

  isOperatorOrAdmin() {
    const role = this.currentUser()?.role;
    return role === 'OPERATOR' || role === 'ADMIN';
  }

  isAdmin() {
    return this.currentUser()?.role === 'ADMIN';
  }

  isCustomer() {
    return this.currentUser()?.role === 'CUSTOMER';
  }

  dashboardUrl() {
    const role = this.currentUser()?.role;
    if (role === 'ADMIN') {
      return '/admin';
    }
    if (role === 'OPERATOR') {
      return '/operator';
    }
    return '/contact';
  }

  private setSession(accessToken: string, user: User) {
    localStorage.setItem(tokenKey, accessToken);
    localStorage.setItem(userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(userKey);
      return null;
    }
  }
}
