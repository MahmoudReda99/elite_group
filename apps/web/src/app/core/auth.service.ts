import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './models';

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
      tap((response) => {
        localStorage.setItem(tokenKey, response.accessToken);
        localStorage.setItem(userKey, JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
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

  dashboardUrl() {
    return this.isAdmin() ? '/admin' : '/operator';
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
