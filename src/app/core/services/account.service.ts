import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Account, AccountRequest, SyncStatus } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAccounts() {
    return this.http.get<{ success: boolean; data: Account[] }>(this.apiUrl);
  }

  getAccount(id: number) {
    return this.http.get<{ success: boolean; data: Account }>(`${this.apiUrl}/${id}`);
  }

  createAccount(account: AccountRequest) {
    return this.http.post<{ success: boolean; data: Account }>(this.apiUrl, account);
  }

  updateAccount(id: number, account: AccountRequest) {
    return this.http.put<{ success: boolean; data: Account }>(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: number) {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  activateAccount(id: number) {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/activate`, {});
  }

  getSyncStatus(id: number) {
    return this.http.get<{ success: boolean; data: SyncStatus }>(`${this.apiUrl}/${id}/status`);
  }
  
  importJson(accountId: number, directoryPath: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiUrl}/import/json/${accountId}`,
      null,
      { params: { directoryPath: directoryPath.replace(/\\/g, '/') } }
    );
  }
}
