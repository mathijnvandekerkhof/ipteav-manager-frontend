import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface BackendResponse {
  success: boolean;
  data: AuthResponse;
  message: string;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthResponse['user'] | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  constructor() {
    this.loadFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('AuthService: Making login request to:', `${environment.apiUrl}/auth/login`);
    return this.http.post<BackendResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('AuthService: Login response received:', response);
          this.setAuth(response.data);
        }),
        map(response => response.data),
        catchError(error => {
          console.error('AuthService: Login failed:', error);
          throw error;
        })
      );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private setAuth(response: AuthResponse): void {
    this._token.set(response.token);
    this._user.set(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  private clearAuth(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr && userStr !== 'undefined') {
      try {
        this._token.set(token);
        this._user.set(JSON.parse(userStr));
      } catch (error) {
        console.warn('Invalid user data in localStorage, clearing...');
        this.clearAuth();
      }
    }
  }
}
