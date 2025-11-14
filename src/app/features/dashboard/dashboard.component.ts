import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>IPTeaV Manager</h1>
        <div class="user-info">
          <span>Welcome, {{ authService.user()?.username }}</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>
      
      <nav class="nav">
        <a routerLink="/dashboard/accounts" routerLinkActive="active">Accounts</a>
        <a routerLink="/dashboard/content" routerLinkActive="active">Content</a>
      </nav>
      
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: var(--background, #121212);
      color: white;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--surface, #1e1e1e);
      border-bottom: 1px solid #333;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .logout-btn {
      padding: 8px 16px;
      background: var(--primary, #1976d2);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .nav {
      display: flex;
      gap: 2rem;
      padding: 1rem 2rem;
      background: var(--surface, #1e1e1e);
      border-bottom: 1px solid #333;
    }
    
    .nav a {
      color: #ccc;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .nav a:hover, .nav a.active {
      color: var(--primary, #1976d2);
      background: rgba(25, 118, 210, 0.1);
    }
    
    .content {
      padding: 2rem;
    }
  `]
})
export class DashboardComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}