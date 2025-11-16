import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  serverStatus = signal<'online' | 'offline'>('offline');
  
  constructor(private http: HttpClient) {
    this.checkHealth();
    interval(30000).subscribe(() => this.checkHealth());
  }
  
  private checkHealth() {
    this.http.get('http://localhost:8080/actuator/health').subscribe({
      next: () => this.serverStatus.set('online'),
      error: () => this.serverStatus.set('offline')
    });
  }
}
