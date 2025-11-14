import { Injectable, signal } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

export interface SyncNotification {
  accountId: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message: string;
  timestamp: string;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private stompClient: Client | null = null;
  
  // Signals for reactive UI
  readonly syncStatus = signal<'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');
  readonly syncMessage = signal<string>('');
  readonly syncProgress = signal<number>(0);
  readonly isConnected = signal<boolean>(false);
  
  // Observable for sync completion events
  readonly syncCompleted$ = new Subject<void>();

  connect(): void {
    if (this.stompClient?.connected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log('STOMP:', str),
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected.set(true);
        this.subscribeToSyncUpdates();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected.set(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected.set(false);
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected.set(false);
    }
  }

  private subscribeToSyncUpdates(): void {
    if (!this.stompClient) return;

    // Subscribe to general sync updates
    this.stompClient.subscribe('/topic/sync', (message) => {
      const notification: SyncNotification = JSON.parse(message.body);
      this.handleSyncUpdate(notification);
    });
  }

  private handleSyncUpdate(notification: SyncNotification): void {
    console.log('Sync update:', notification);
    
    this.syncStatus.set(notification.status);
    this.syncMessage.set(notification.message);
    
    if (notification.progress !== undefined) {
      this.syncProgress.set(notification.progress);
    }
    
    // Reset progress on completion or failure
    if (notification.status === 'COMPLETED') {
      this.syncCompleted$.next();
      setTimeout(() => {
        this.syncStatus.set('IDLE');
        this.syncMessage.set('');
        this.syncProgress.set(0);
      }, 3000);
    } else if (notification.status === 'FAILED') {
      setTimeout(() => {
        this.syncStatus.set('IDLE');
        this.syncMessage.set('');
        this.syncProgress.set(0);
      }, 5000); // Show error longer
    }
  }
}