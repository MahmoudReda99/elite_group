import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: ApiService,
          useValue: {
            login: jasmine.createSpy('login').and.returnValue(
              of({
                accessToken: 'token',
                user: { id: '1', name: 'Admin', email: 'admin@elitegroup.local', role: 'ADMIN' }
              })
            )
          }
        },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ]
    });

    auth = TestBed.inject(AuthService);
  });

  it('stores tokens and exposes admin state after login', (done) => {
    auth.login('admin@elitegroup.local', 'Elite@2026!').subscribe(() => {
      expect(auth.token()).toBe('token');
      expect(auth.isAdmin()).toBeTrue();
      expect(auth.dashboardUrl()).toBe('/admin');
      done();
    });
  });

  it('clears session on logout', () => {
    localStorage.setItem('elite_group_access_token', 'token');
    auth.logout();
    expect(auth.token()).toBeNull();
    expect(auth.currentUser()).toBeNull();
  });
});
