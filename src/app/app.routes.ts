import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/content',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'accounts',
    loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'accounts/new',
    loadComponent: () => import('./features/accounts/account-form.component').then(m => m.AccountFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'accounts/edit/:id',
    loadComponent: () => import('./features/accounts/account-form.component').then(m => m.AccountFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'content',
    loadComponent: () => import('./features/content/content.component').then(m => m.ContentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'vod',
    loadComponent: () => import('./features/vod/vod-list.component').then(m => m.VodListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'vod/:id',
    loadComponent: () => import('./features/vod/vod-list.component').then(m => m.VodListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'series',
    loadComponent: () => import('./features/series/series-list.component').then(m => m.SeriesListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'series/:id',
    loadComponent: () => import('./features/series/series-detail.component').then(m => m.SeriesDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'player',
    loadComponent: () => import('./features/player/player.component').then(m => m.PlayerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard]
  }
];
