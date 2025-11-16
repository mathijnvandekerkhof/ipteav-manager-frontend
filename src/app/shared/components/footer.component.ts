import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HealthService } from '../../core/services/health.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <footer class="app-footer">
      <div class="status">
        <mat-icon [class.online]="healthService.serverStatus() === 'online'" 
                  [class.offline]="healthService.serverStatus() === 'offline'">
          {{ healthService.serverStatus() === 'online' ? 'check_circle' : 'cancel' }}
        </mat-icon>
        <span>Server: {{ healthService.serverStatus() }}</span>
      </div>
      <div class="info">
        <span>IPTeaV Manager v1.0.0</span>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: var(--surface-color, #1a1a1a);
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      font-size: 14px;
      z-index: 1000;
    }
    
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .status mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .status mat-icon.online {
      color: #4caf50;
    }
    
    .status mat-icon.offline {
      color: #f44336;
    }
    
    .info {
      color: var(--text-secondary, #999);
    }
  `]
})
export class FooterComponent {
  constructor(public healthService: HealthService) {}
}
