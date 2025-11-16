import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VideoPlayerComponent } from '../../shared/components/video-player.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    VideoPlayerComponent
  ],
  template: `
    <div class="player-page">
      <div class="player-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ title() }}</h2>
      </div>
      
      <app-video-player [streamUrl]="streamUrl()"></app-video-player>
    </div>
  `,
  styles: [`
    .player-page {
      padding: 20px;
      background: #000;
      min-height: 100vh;
    }
    
    .player-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      color: #fff;
    }
    
    .player-header h2 {
      margin: 0;
    }
  `]
})
export class PlayerComponent implements OnInit {
  streamUrl = signal('');
  title = signal('');
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.streamUrl.set(params['url'] || '');
      this.title.set(params['title'] || 'Player');
    });
  }
  
  goBack() {
    this.router.navigate(['/content']);
  }
}
