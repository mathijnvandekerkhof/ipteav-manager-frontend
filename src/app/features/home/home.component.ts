import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="home-container">
      <div class="header">
        <h1>IPTeaV Manager</h1>
        <div class="actions">
          <button mat-icon-button (click)="themeService.toggleTheme()">
            <mat-icon>{{ themeService.currentTheme() === 'tivimate' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
          <button mat-button (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Welcome, {{ authService.currentUser()?.username }}!</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Theme: <strong>{{ themeService.currentTheme() }}</strong></p>
          <p>Role: <strong>{{ authService.currentUser()?.role }}</strong></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    mat-card {
      max-width: 600px;
    }
  `]
})
export class HomeComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}
}
