import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LIVE_REFRESH_INTERVAL_MS } from '../../core/live-refresh';
import { User } from '../../core/models';

@Component({
  selector: 'eg-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="dashboard-shell">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Users</p>
          <h1>Create users and review admin/operator access.</h1>
        </div>
        <button type="button" (click)="load()">Refresh</button>
      </header>

      <section class="dashboard-grid">
        <form class="tool-panel" (ngSubmit)="createUser()">
          <h2>Create user</h2>
          <input name="name" [(ngModel)]="userForm.name" placeholder="Name" required>
          <input name="email" [(ngModel)]="userForm.email" placeholder="Email" type="email" required>
          <input name="password" [(ngModel)]="userForm.password" placeholder="Password" type="password" required>
          <select name="role" [(ngModel)]="userForm.role">
            <option value="OPERATOR">Operator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit">Create user</button>
        </form>

        <article class="tool-panel wide">
          <h2>Users</h2>
          @for (user of users; track user.id) {
            <div class="queue-item">
              <strong>{{ user.name }}</strong>
              <span>{{ user.email }} / {{ user.role }} / {{ user.active ? 'Active' : 'Inactive' }}</span>
            </div>
          } @empty {
            <p>No users loaded.</p>
          }
        </article>
      </section>
    </section>
  `
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  private refreshSubscription?: Subscription;
  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR' as 'OPERATOR' | 'ADMIN'
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
    this.refreshSubscription = interval(LIVE_REFRESH_INTERVAL_MS).subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  load() {
    this.api.users().subscribe((users) => (this.users = users));
  }

  createUser() {
    this.api.createUser(this.userForm).subscribe(() => {
      this.userForm = { name: '', email: '', password: '', role: 'OPERATOR' };
      this.load();
    });
  }
}
