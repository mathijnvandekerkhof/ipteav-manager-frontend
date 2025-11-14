import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map, interval, switchMap, startWith } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServerStatus {
  status: string;
  version: string;
  timestamp: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private pollSubscription?: any;
  
  readonly serverStatus = signal<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  readonly serverInfo = signal<{version: string, timestamp: string, message: string} | null>(null);

  checkHealth(): Observable<ServerStatus> {
    this.serverStatus.set('CHECKING');
    
    return this.http.get<{success: boolean, data: ServerStatus}>(`${environment.apiUrl}/server/status`)
      .pipe(
        map(response => response.data),
        tap(status => {
          this.serverStatus.set(status.status === 'ONLINE' ? 'UP' : 'DOWN');
          this.serverInfo.set({
            version: status.version,
            timestamp: status.timestamp,
            message: status.message
          });
        }),
        catchError(() => {
          this.serverStatus.set('DOWN');
          this.serverInfo.set({
            version: 'Unknown',
            timestamp: new Date().toISOString(),
            message: 'Server not reachable'
          });
          return of({ 
            status: 'OFFLINE', 
            version: 'Unknown', 
            timestamp: new Date().toISOString(),
            message: 'Server not reachable'
          });
        })
      );
  }

  startPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    
    this.pollSubscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.checkHealth())
      )
      .subscribe();
  }

  stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}