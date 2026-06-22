import { Routes } from '@angular/router';
import { adminGuard, operatorGuard } from './core/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { SchedulesComponent } from './pages/schedules/schedules.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { ContainerCategoryComponent } from './pages/services/container-category.component';
import { ContainerDetailComponent } from './pages/services/container-detail.component';
import { ContainerOverviewComponent } from './pages/services/container-overview.component';
import { CustomsSolutionsComponent } from './pages/services/customs-solutions.component';
import { InlandTransportationComponent } from './pages/services/inland-transportation.component';
import { OperatorDashboardComponent } from './pages/operator-dashboard/operator-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminDatabaseComponent } from './pages/admin-database/admin-database.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Elite Group' },
  { path: 'services', component: ServicesComponent, title: 'Services | Elite Group' },
  { path: 'services/containers', component: ContainerOverviewComponent, title: 'Containers | Elite Group' },
  {
    path: 'services/containers/:category/:slug',
    component: ContainerDetailComponent,
    title: 'Container Details | Elite Group'
  },
  {
    path: 'services/containers/:category',
    component: ContainerCategoryComponent,
    title: 'Container Category | Elite Group'
  },
  {
    path: 'services/inland-transportation',
    component: InlandTransportationComponent,
    title: 'Inland Transportation | Elite Group'
  },
  {
    path: 'services/customs-solutions',
    component: CustomsSolutionsComponent,
    title: 'Customs Support & Solutions | Elite Group'
  },
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
