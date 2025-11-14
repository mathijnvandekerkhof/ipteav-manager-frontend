import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncService } from '../../../core/services/sync.service';

@Component({
  selector: 'app-sync-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-status" [class]="statusClass()">
      @if (syncService.syncStatus() !== 'IDLE') {
        <div class="sync-content">
          <div class="sync-icon">
            @switch (syncService.syncStatus()) {
              @case ('PROCESSING') {
                <div class="spinner"></div>
              }
              @case ('COMPLETED') {
                <span class="icon">✅</span>
              }
              @case ('FAILED') {
                <span class="icon">❌</span>
              }
            }
          </div>
          
          <div class="sync-text">
            <div class="sync-message">{{ syncService.syncMessage() }}</div>
            @if (syncService.syncProgress() > 0 && syncService.syncStatus() === 'PROCESSING') {
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="syncService.syncProgress()"></div>
              </div>
              <div class="progress-text">{{ syncService.syncProgress() }}%</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sync-status {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    .sync-status.processing {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
    }
    
    .sync-status.completed {
      background: #e8f5e8;
      border-left: 4px solid #4caf50;
    }
    
    .sync-status.failed {
      background: #ffebee;
      border-left: 4px solid #f44336;
    }
    
    .sync-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .sync-icon .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e0e0e0;
      border-top: 2px solid #2196f3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .sync-icon .icon {
      font-size: 20px;
    }
    
    .sync-text {
      flex: 1;
    }
    
    .sync-message {
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    
    .progress-fill {
      height: 100%;
      background: #2196f3;
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 12px;
      color: #666;
      text-align: right;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SyncStatusComponent {
  readonly syncService = inject(SyncService);
  
  readonly statusClass = computed(() => {
    const status = this.syncService.syncStatus();
    return status.toLowerCase();
  });
}