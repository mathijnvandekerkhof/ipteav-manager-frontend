import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, delay } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user';
  
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private router: Router) {}

  login(credentials: { username: string; password: string }) {
    // Mock login - accept any credentials
    const mockUser: User = {
      id: 1,
      username: credentials.username,
      email: `${credentials.username}@test.com`,
      role: credentials.username === 'admin' ? 'ADMIN' : 'USER'
    };

    const mockToken = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem(this.TOKEN_KEY, mockToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
    this.currentUser.set(mockUser);

    return of({ token: mockToken, refreshToken: 'mock-refresh', user: mockUser }).pipe(delay(500));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson || userJson === 'undefined') return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
