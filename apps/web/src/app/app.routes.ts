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
import { AdminDatabaseComponent } from './pages/admin-database/admin-database.component';
import { AdminOverviewComponent } from './pages/workspace/admin-overview.component';
import { AdminStatisticsComponent } from './pages/workspace/admin-statistics.component';
import { AdminUsersComponent } from './pages/workspace/admin-users.component';
import { AuditLogsPageComponent } from './pages/workspace/audit-logs-page.component';
import { CompanyProfilePageComponent } from './pages/workspace/company-profile-page.component';
import { ContactMessagesPageComponent } from './pages/workspace/contact-messages-page.component';
import { FreightServicesWorkspaceComponent } from './pages/workspace/freight-services-workspace.component';
import { OperatorOverviewComponent } from './pages/workspace/operator-overview.component';
import { QuoteRequestsPageComponent } from './pages/workspace/quote-requests-page.component';
import { RecentActivityPageComponent } from './pages/workspace/recent-activity-page.component';
import { TrackingRecordsPageComponent } from './pages/workspace/tracking-records-page.component';

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
    canActivate: [operatorGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OperatorOverviewComponent, title: 'Operator Overview | Elite Group' },
      { path: 'freight-services', component: FreightServicesWorkspaceComponent, title: 'Freight Services | Elite Group' },
      { path: 'quote-requests', component: QuoteRequestsPageComponent, title: 'Quote Requests | Elite Group' },
      { path: 'contact-messages', component: ContactMessagesPageComponent, title: 'Contact Messages | Elite Group' },
      { path: 'tracking-records', component: TrackingRecordsPageComponent, title: 'Tracking Records | Elite Group' }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminOverviewComponent, title: 'Admin Overview | Elite Group' },
      { path: 'statistics', component: AdminStatisticsComponent, title: 'Statistics | Elite Group' },
      { path: 'users', component: AdminUsersComponent, title: 'Users | Elite Group' },
      { path: 'services', component: FreightServicesWorkspaceComponent, title: 'Services | Elite Group' },
      { path: 'tracking-records', component: TrackingRecordsPageComponent, title: 'Tracking Records | Elite Group' },
      { path: 'quote-requests', component: QuoteRequestsPageComponent, title: 'Quote Requests | Elite Group' },
      { path: 'audit-logs', component: AuditLogsPageComponent, title: 'Audit Logs | Elite Group' },
      { path: 'database', component: AdminDatabaseComponent, title: 'Database | Elite Group' },
      { path: 'database/:tableKey', component: AdminDatabaseComponent, title: 'Database Table | Elite Group' },
      { path: 'company-profile', component: CompanyProfilePageComponent, title: 'Company Profile | Elite Group' },
      { path: 'contact-messages', component: ContactMessagesPageComponent, title: 'Contact Messages | Elite Group' },
      { path: 'recent-activity', component: RecentActivityPageComponent, title: 'Recent Activity | Elite Group' }
    ]
  },
  { path: '**', redirectTo: '' }
];
