import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="onRegister()">
            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="username" name="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            @if (error()) {
              <div class="error">{{ error() }}</div>
            }

            @if (success()) {
              <div class="success">{{ success() }}</div>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
              {{ loading() ? 'Registering...' : 'Register' }}
            </button>

            <button mat-button type="button" (click)="goToLogin()">
              Already have an account? Login
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 400px;
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
    }

    .success {
      color: #4caf50;
      font-size: 14px;
    }

    button[type="submit"] {
      width: 100%;
      height: 48px;
    }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onRegister() {
    if (!this.username || !this.email || !this.password) {
      this.error.set('Please fill all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.http.post(`${environment.apiUrl}/users/register`, {
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Registration successful! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
