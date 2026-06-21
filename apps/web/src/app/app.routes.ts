import { Routes } from '@angular/router';
import { adminGuard, operatorGuard } from './core/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { SchedulesComponent } from './pages/schedules/schedules.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { OperatorDashboardComponent } from './pages/operator-dashboard/operator-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminDatabaseComponent } from './pages/admin-database/admin-database.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Elite Group' },
  { path: 'services', component: ServicesComponent, title: 'Services | Elite Group' },
  { path: 'schedules', component: SchedulesComponent, title: 'Schedules | Elite Group' },
  { path: 'tracking', component: TrackingComponent, title: 'Tracking | Elite Group' },
  { path: 'contact', component: ContactComponent, title: 'Contact | Elite Group' },
  { path: 'login', component: LoginComponent, title: 'Login | Elite Group' },
  {
    path: 'operator',
    component: OperatorDashboardComponent,
    canActivate: [operatorGuard],
    title: 'Operator Dashboard | Elite Group'
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    title: 'Admin Dashboard | Elite Group'
  },
  {
    path: 'admin/database',
    component: AdminDatabaseComponent,
    canActivate: [adminGuard],
    title: 'Database | Elite Group'
  },
  { path: '**', redirectTo: '' }
];
