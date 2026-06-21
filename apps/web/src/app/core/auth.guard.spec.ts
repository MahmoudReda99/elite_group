import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard, operatorGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('auth guards', () => {
  function runGuard(guard: typeof adminGuard | typeof operatorGuard) {
    return TestBed.runInInjectionContext(() => guard({} as never, {} as never));
  }

  it('allows operators into the operator dashboard', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isOperatorOrAdmin: () => true, isAdmin: () => false } },
        { provide: Router, useValue: { createUrlTree: jasmine.createSpy('createUrlTree') } }
      ]
    });

    expect(runGuard(operatorGuard)).toBeTrue();
  });

  it('redirects non-admin users away from admin dashboard', () => {
    const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('/login') };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isOperatorOrAdmin: () => true, isAdmin: () => false } },
        { provide: Router, useValue: router }
      ]
    });

    expect(runGuard(adminGuard)).toBe('/login' as never);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
