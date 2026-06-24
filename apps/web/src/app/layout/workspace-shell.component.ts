import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { FooterComponent } from './footer.component';

interface ShellNavItem {
  label: string;
  path: string;
  icon: string;
}

const shellIconPaths: Record<string, string> = {
  'icon-home': '<path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-6h5v6"/>',
  'icon-services': '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16"/><path d="M8 15h8"/>',
  'icon-tracking': '<circle cx="12" cy="12" r="8"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/>',
  'icon-contact': '<path d="M4 6h16v10H8l-4 4V6Z"/><path d="M8 10h8"/><path d="M8 13h5"/>',
  'icon-login': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>',
  'icon-logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  'icon-dashboard': '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  'icon-database': '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/>',
  'icon-users': '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.7-3.2 2.6-5 5.5-5s4.8 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.5.3 4.1 1.9 4.7 4.8"/>',
  'icon-quote': '<path d="M4 5h16v12H8l-4 4V5Z"/><path d="M8 9h8"/><path d="M8 13h6"/>',
  'icon-audit': '<path d="M12 3 5 6v5c0 4.1 2.7 7.9 7 10 4.3-2.1 7-5.9 7-10V6l-7-3Z"/><path d="m8.8 12.2 2.2 2.2 4.5-5"/>',
  'icon-company': '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><path d="M8 7h4"/><path d="M8 11h4"/><path d="M8 15h4"/><path d="M3 21h18"/>'
};

@Component({
  selector: 'eg-workspace-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FooterComponent],
  template: `
    <section
      class="app-shell"
      [class.sidebar-collapsed]="collapsed()"
      [class.drawer-open]="drawerOpen()"
      [class.login-shell]="isLoginRoute()"
      [class.public-shell]="isPublicShell()"
      [class.staff-shell]="isStaffShell()"
      [class.sidebar-hidden]="!showSidebar()"
    >
      <header class="workspace-topbar">
        <button class="menu-button" type="button" (click)="toggleDrawer()" title="Open navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <a routerLink="/" class="workspace-brand" aria-label="Elite Group home">
          <img src="assets/images/elite-logo.jpeg" alt="Elite Group logo">
          <span>
            <strong>ELITE GROUP</strong>
            <small>YOUR CARGO, OUR PROMISE</small>
          </span>
        </a>

        @if (showPublicTopNav()) {
          <nav class="workspace-public-nav" aria-label="Primary navigation">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            <a routerLink="/services" routerLinkActive="active">Services</a>
            <a routerLink="/tracking" routerLinkActive="active">Tracking</a>
            <a routerLink="/contact" routerLinkActive="active">Contact</a>
          </nav>
        } @else {
          <span class="workspace-topbar-spacer" aria-hidden="true"></span>
        }

        <div class="workspace-account">
          @if (user()) {
            <button class="topbar-icon search-icon" type="button" title="Search">
              <span class="sr-only">Search</span>
            </button>
            <button class="topbar-icon bell-icon" type="button" title="Notifications">
              <span class="notification-badge">3</span>
              <span class="sr-only">Notifications</span>
            </button>
            <div class="account-card">
              <span class="account-avatar">{{ initials(user()?.name || user()?.email) }}</span>
              <span class="account-copy">
                <strong>{{ user()?.name || user()?.email }}</strong>
                <small>{{ roleLabel() }}</small>
              </span>
              <span class="account-chevron" aria-hidden="true"></span>
            </div>
            <span class="topbar-divider"></span>
            <button class="sign-out-button" type="button" (click)="logout()">
              <span class="sign-out-icon" aria-hidden="true"></span>
              <span>Sign out</span>
            </button>
          } @else {
            <a class="button-link shell-action" routerLink="/login">Login</a>
          }
        </div>
      </header>

      @if (showSidebar()) {
        <aside class="workspace-sidebar" aria-label="Workspace navigation">
          <nav class="sidebar-nav">
            @for (item of navItems(); track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.path === '/' || item.path.endsWith('/overview') }"
                [title]="item.label"
                (click)="closeDrawer()"
              >
                <span class="shell-icon" [innerHTML]="iconSvg(item.icon)" aria-hidden="true"></span>
                <span class="sidebar-label">{{ item.label }}</span>
              </a>
            }
          </nav>

          <div class="sidebar-actions">
            @if (user()) {
              <button class="sidebar-logout" type="button" (click)="logout()" title="Sign out">
                <span class="shell-icon" [innerHTML]="iconSvg('icon-logout')" aria-hidden="true"></span>
                <span class="sidebar-label">Sign out</span>
              </button>
            }

            <button class="sidebar-collapse" type="button" (click)="toggleCollapsed()" title="Collapse navigation">
              <span class="collapse-icon" aria-hidden="true"></span>
            </button>
          </div>
        </aside>
      }

      @if (drawerOpen() && showSidebar()) {
        <button class="drawer-backdrop" type="button" (click)="closeDrawer()" aria-label="Close navigation"></button>
      }

      <div class="workspace-main">
        <main>
          <router-outlet />
        </main>
        @if (!user()) {
          <eg-footer />
        }
      </div>
    </section>
  `
})
export class WorkspaceShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly sanitizedIcons: Record<string, SafeHtml> = Object.entries(shellIconPaths).reduce(
    (icons, [key, paths]) => ({
      ...icons,
      [key]: this.sanitizer.bypassSecurityTrustHtml(
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
      )
    }),
    {}
  );
  readonly user = this.auth.currentUser;
  readonly collapsed = signal(false);
  readonly drawerOpen = signal(false);
  readonly currentUrl = signal(this.router.url);
  readonly isLoginRoute = computed(() => this.currentUrl().split('?')[0] === '/login');
  readonly isStaffShell = computed(() => {
    const role = this.user()?.role;
    return !this.isLoginRoute() && (role === 'ADMIN' || role === 'OPERATOR');
  });
  readonly isPublicShell = computed(() => !this.isLoginRoute() && !this.isStaffShell());
  readonly showSidebar = computed(() => !this.isLoginRoute());
  readonly showPublicTopNav = computed(() => this.isPublicShell());

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
        this.closeDrawer();
      }
    });
  }

  readonly navItems = computed<ShellNavItem[]>(() => {
    const user = this.user();

    if (!user) {
      return [
        { label: 'Home', path: '/', icon: 'icon-home' },
        { label: 'Services', path: '/services', icon: 'icon-services' },
        { label: 'Tracking', path: '/tracking', icon: 'icon-tracking' },
        { label: 'Contact', path: '/contact', icon: 'icon-contact' },
        { label: 'Login', path: '/login', icon: 'icon-login' }
      ];
    }

    if (user.role === 'CUSTOMER') {
      return [
        { label: 'Home', path: '/', icon: 'icon-home' },
        { label: 'Services', path: '/services', icon: 'icon-services' },
        { label: 'Tracking', path: '/tracking', icon: 'icon-tracking' },
        { label: 'Contact', path: '/contact', icon: 'icon-contact' }
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/overview', icon: 'icon-dashboard' },
        { label: 'Database', path: '/admin/database', icon: 'icon-database' },
        { label: 'Users', path: '/admin/users', icon: 'icon-users' },
        { label: 'Services', path: '/admin/services', icon: 'icon-services' },
        { label: 'Tracking Records', path: '/admin/tracking-records', icon: 'icon-tracking' },
        { label: 'Quote Requests', path: '/admin/quote-requests', icon: 'icon-quote' },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'icon-audit' },
        { label: 'Company Profile', path: '/admin/company-profile', icon: 'icon-company' },
        { label: 'Contact Messages', path: '/admin/contact-messages', icon: 'icon-contact' }
      ];
    }

    return [
      { label: 'Overview', path: '/operator/overview', icon: 'icon-home' },
      { label: 'Freight Services', path: '/operator/freight-services', icon: 'icon-services' },
      { label: 'Quote Requests', path: '/operator/quote-requests', icon: 'icon-quote' },
      { label: 'Contact Messages', path: '/operator/contact-messages', icon: 'icon-contact' },
      { label: 'Tracking Records', path: '/operator/tracking-records', icon: 'icon-tracking' }
    ];
  });

  toggleCollapsed() {
    this.collapsed.update((value) => !value);
  }

  toggleDrawer() {
    this.drawerOpen.update((value) => !value);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeDrawer();
    void this.router.navigateByUrl('/');
  }

  initials(value?: string) {
    if (!value) {
      return 'EG';
    }

    return value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  iconSvg(icon: string) {
    return this.sanitizedIcons[icon] || this.sanitizedIcons['icon-home'];
  }

  roleLabel() {
    const role = this.user()?.role;
    if (role === 'ADMIN') {
      return 'Administrator';
    }
    if (role === 'OPERATOR') {
      return 'Operator';
    }
    return 'Customer';
  }
}
