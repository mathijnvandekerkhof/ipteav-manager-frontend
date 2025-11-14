import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncService } from '../../core/services/sync.service';
import { SyncStatusComponent } from '../../shared/components/sync-status/sync-status.component';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-sync-demo',
  standalone: true,
  imports: [CommonModule, SyncStatusComponent],
  template: `
    <div class="sync-demo">
      <app-sync-status></app-sync-status>
      
      <div class="demo-container">
        <h2>WebSocket Sync Demo</h2>
        
        <div class="status-info">
          <div class="status-item">
            <label>WebSocket Status:</label>
            <span [class]="syncService.isConnected() ? 'connected' : 'disconnected'">
              {{ syncService.isConnected() ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          
          <div class="status-item">
            <label>Sync Status:</label>
            <span [class]="'status-' + syncService.syncStatus().toLowerCase()">
              {{ syncService.syncStatus() }}
            </span>
          </div>
          
          @if (syncService.syncMessage()) {
            <div class="status-item">
              <label>Message:</label>
              <span>{{ syncService.syncMessage() }}</span>
            </div>
          }
          
          @if (syncService.syncProgress() > 0) {
            <div class="status-item">
              <label>Progress:</label>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="syncService.syncProgress()"></div>
                </div>
                <span class="progress-text">{{ syncService.syncProgress() }}%</span>
              </div>
            </div>
          }
        </div>
        
        <div class="actions">
          <button 
            (click)="connect()" 
            [disabled]="syncService.isConnected()"
            class="btn btn-primary">
            Connect WebSocket
          </button>
          
          <button 
            (click)="disconnect()" 
            [disabled]="!syncService.isConnected()"
            class="btn btn-secondary">
            Disconnect
          </button>
          
          <button 
            (click)="triggerSync()" 
            [disabled]="!syncService.isConnected() || syncService.syncStatus() === 'PROCESSING'"
            class="btn btn-success">
            Trigger Sync
          </button>
        </div>
        
        <div class="info">
          <h3>How it works:</h3>
          <ol>
            <li>Click "Connect WebSocket" to establish connection</li>
            <li>Click "Trigger Sync" to start IPTV content synchronization</li>
            <li>Watch real-time progress updates in the top-right corner</li>
            <li>Content will be automatically reloaded when sync completes</li>
          </ol>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sync-demo {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .demo-container {
      background: var(--surface, #1e1e1e);
      padding: 2rem;
      border-radius: 8px;
      margin-top: 2rem;
    }
    
    .status-info {
      margin: 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .status-item label {
      font-weight: bold;
      min-width: 120px;
    }
    
    .connected {
      color: #4caf50;
      font-weight: bold;
    }
    
    .disconnected {
      color: #f44336;
      font-weight: bold;
    }
    
    .status-idle { color: #666; }
    .status-processing { color: #2196f3; }
    .status-completed { color: #4caf50; }
    .status-failed { color: #f44336; }
    
    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: #2196f3;
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 0.9rem;
      color: #ccc;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      margin: 2rem 0;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #2196f3;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #1976d2;
    }
    
    .btn-secondary {
      background: #666;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #555;
    }
    
    .btn-success {
      background: #4caf50;
      color: white;
    }
    
    .btn-success:hover:not(:disabled) {
      background: #45a049;
    }
    
    .info {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--background, #121212);
      border-radius: 6px;
    }
    
    .info h3 {
      margin-top: 0;
      color: var(--primary, #2196f3);
    }
    
    .info ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }
    
    .info li {
      margin: 0.5rem 0;
      color: #ccc;
    }
  `]
})
export class SyncDemoComponent implements OnInit, OnDestroy {
  readonly syncService = inject(SyncService);
  readonly contentService = inject(ContentService);

  ngOnInit(): void {
    // Auto-connect if not already connected
    if (!this.syncService.isConnected()) {
      this.syncService.connect();
    }
  }

  ngOnDestroy(): void {
    // Don't disconnect here as other components might be using it
  }

  connect(): void {
    this.syncService.connect();
  }

  disconnect(): void {
    this.syncService.disconnect();
  }

  triggerSync(): void {
    this.contentService.refreshContent().subscribe({
      next: () => {
        console.log('Sync triggered successfully');
      },
      error: (error) => {
        console.error('Failed to trigger sync:', error);
        alert('Failed to trigger sync. Make sure you have an active IPTV account.');
      }
    });
  }
}