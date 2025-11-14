import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthService } from '../../core/services/health.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="server-status">
          <div class="status-indicator" [class]="'status-' + serverStatus().toLowerCase()">
            <span class="status-dot"></span>
            <span class="status-text">
              @switch (serverStatus()) {
                @case ('UP') { 
                  Server Online
                  @if (serverInfo()) {
                    <small> - v{{ serverInfo()!.version }}</small>
                  }
                }
                @default { Server Offline }
              }
            </span>
          </div>
        </div>
        <div class="app-info">
          <span>IPTeaV Manager © 2025</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--surface, #1e1e1e);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      z-index: 1000;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .server-status {
      display: flex;
      align-items: center;
    }
    
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-up {
      color: #4caf50;
    }
    
    .status-down {
      color: #f44336;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .status-text small {
      opacity: 0.8;
      font-weight: normal;
    }
    
    .app-info {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
    }
    

    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 4px;
      }
      
      .status-indicator {
        font-size: 11px;
      }
      
      .app-info {
        font-size: 10px;
      }
    }
  `]
})
export class FooterComponent implements OnInit, OnDestroy {
  private readonly healthService = inject(HealthService);
  
  readonly serverStatus = this.healthService.serverStatus;
  readonly serverInfo = this.healthService.serverInfo;

  ngOnInit(): void {
    this.healthService.startPolling();
  }

  ngOnDestroy(): void {
    this.healthService.stopPolling();
  }
}