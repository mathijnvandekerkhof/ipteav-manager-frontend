import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>IPTeaV Manager</h1>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <input 
              type="text" 
              formControlName="username" 
              placeholder="Username"
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
          </div>
          
          <div class="form-group">
            <input 
              type="password" 
              formControlName="password" 
              placeholder="Password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
          </div>
          
          @if (errorMessage()) {
            <div class="error-message">{{ errorMessage() }}</div>
          }
          
          <button 
            type="submit" 
            [disabled]="loginForm.invalid || loading()"
            class="login-btn">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--background, #121212);
    }
    
    .login-card {
      background: var(--surface, #1e1e1e);
      padding: 2rem;
      border-radius: var(--card-radius, 12px);
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    
    h1 {
      text-align: center;
      color: var(--primary, #1976d2);
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      background: var(--background, #121212);
      color: white;
      font-size: 16px;
    }
    
    input.error {
      border-color: #f44336;
    }
    
    .login-btn {
      width: 100%;
      padding: 12px;
      background: var(--primary, #1976d2);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #f44336;
      text-align: center;
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  
  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });



  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.errorMessage.set('');
    console.log('Attempting login...');
    
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage.set('Invalid username or password');
        this.loading.set(false);
      }
    });
  }
}