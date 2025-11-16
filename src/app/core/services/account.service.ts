import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Account {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  isActive: boolean;
  lastSync?: string;
  status?: 'SYNCING' | 'COMPLETED' | 'FAILED';
}

export interface CreateAccountRequest {
  name: string;
  host: string;
  port?: number;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  
  readonly accounts = signal<Account[]>([]);
  readonly loading = signal(false);

  getAccounts(): Observable<Account[]> {
    this.loading.set(true);
    return this.http.get<{success: boolean, data: Account[]}>(`${environment.apiUrl}/accounts`)
      .pipe(
        map(response => response.data || []),
        tap(accounts => {
          this.accounts.set(accounts);
          this.loading.set(false);
        })
      );
  }

  createAccount(account: CreateAccountRequest): Observable<Account> {
    return this.http.post<{success: boolean, data: Account}>(`${environment.apiUrl}/accounts`, account)
      .pipe(
        map(response => response.data),
        tap(newAccount => {
          this.accounts.update(accounts => [...accounts, newAccount]);
        })
      );
  }

  activateAccount(id: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/accounts/${id}/activate`, {});
  }



  getAccountStatus(id: number): Observable<{ status: string; message?: string }> {
    return this.http.get<{ status: string; message?: string }>(`${environment.apiUrl}/accounts/${id}/status`);
  }

  updateAccount(id: number, account: Partial<CreateAccountRequest>): Observable<Account> {
    return this.http.put<{success: boolean, data: Account}>(`${environment.apiUrl}/accounts/${id}`, account)
      .pipe(
        map(response => response.data),
        tap(updatedAccount => {
          this.accounts.update(accounts => 
            accounts.map(a => a.id === id ? updatedAccount : a)
          );
        })
      );
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/accounts/${id}`)
      .pipe(
        tap(() => {
          this.accounts.update(accounts => accounts.filter(a => a.id !== id));
        })
      );
  }

  downloadPlaylist(): Observable<{success: boolean, data: string}> {
    return this.http.post<{success: boolean, data: string}>(`${environment.apiUrl}/playlist/download`, {});
  }
}