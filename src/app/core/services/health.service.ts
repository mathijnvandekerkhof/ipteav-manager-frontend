import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServerStatus {
  status: string;
  version: string;
  timestamp: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  
  readonly serverStatus = signal<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');

  checkHealth(): Observable<ServerStatus> {
    this.serverStatus.set('CHECKING');
    
    return this.http.get<{success: boolean, data: ServerStatus}>(`${environment.apiUrl}/server/status`)
      .pipe(
        map(response => response.data),
        tap(status => {
          this.serverStatus.set(status.status === 'ONLINE' ? 'UP' : 'DOWN');
        }),
        catchError(() => {
          this.serverStatus.set('DOWN');
          return of({ 
            status: 'OFFLINE', 
            version: 'Unknown', 
            timestamp: new Date().toISOString(),
            message: 'Server not reachable'
          });
        })
      );
  }
}