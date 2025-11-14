import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'accounts', pathMatch: 'full' },
      { path: 'accounts', loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent) },
      { path: 'content', loadComponent: () => import('./features/content/content.component').then(m => m.ContentComponent) },
      { path: 'sync-demo', loadComponent: () => import('./features/sync-demo/sync-demo.component').then(m => m.SyncDemoComponent) }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
