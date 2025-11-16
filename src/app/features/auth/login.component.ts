import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>IPTeaV Manager</mat-card-title>
          <button mat-icon-button (click)="themeService.toggleTheme()" class="theme-toggle">
            <mat-icon>{{ themeService.currentTheme() === 'tivimate' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="username" name="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            @if (error()) {
              <div class="error">{{ error() }}</div>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
              {{ loading() ? 'Logging in...' : 'Login' }}
            </button>

            <button mat-button type="button" (click)="goToRegister()">
              Don't have an account? Register
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .theme-toggle {
      margin-left: auto;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    .error {
      color: #f44336;
      font-size: 14px;
      margin-top: -8px;
    }

    button[type="submit"] {
      width: 100%;
      height: 48px;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.error.set('Please enter username and password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/content']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Login failed');
        }
      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
