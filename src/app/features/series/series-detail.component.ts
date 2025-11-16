import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { VodService } from '../../core/services/vod.service';
import { Series, Episode } from '../../core/models/vod.model';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  template: `
    <div class="detail-container">
      @if (loading()) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else if (series()) {
        <div class="series-header">
          @if (series()!.logo) {
            <img [src]="series()!.logo" [alt]="series()!.name">
          }
          <div class="info">
            <h1>{{ series()!.name }}</h1>
            @if (series()!.rating) {
              <div class="rating">
                <mat-icon>star</mat-icon>
                {{ series()!.rating }}
              </div>
            }
            @if (series()!.plot) {
              <p>{{ series()!.plot }}</p>
            }
            @if (series()!.cast) {
              <p><strong>Cast:</strong> {{ series()!.cast }}</p>
            }
          </div>
        </div>
        
        <div class="episodes-section">
          <h2>Episodes</h2>
          @for (season of groupedEpisodes(); track season.number) {
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  Season {{ season.number }} ({{ season.episodes.length }} episodes)
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="episodes-list">
                @for (ep of season.episodes; track ep.id) {
                  <mat-card class="episode-card" (click)="playEpisode(ep)">
                    <mat-card-content>
                      <div class="episode-header">
                        <span class="episode-number">E{{ ep.episodeNumber }}</span>
                        <h4>{{ ep.title }}</h4>
                      </div>
                      @if (ep.plot) {
                        <p>{{ ep.plot }}</p>
                      }
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </mat-expansion-panel>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 20px;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .series-header {
      display: flex;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .series-header img {
      width: 300px;
      height: 450px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .info {
      flex: 1;
    }
    
    .info h1 {
      margin: 0 0 16px 0;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffc107;
      font-size: 18px;
      margin-bottom: 16px;
    }
    
    .episodes-section {
      margin-top: 40px;
    }
    
    .episodes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
    }
    
    .episode-card {
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .episode-card:hover {
      background: var(--hover-color);
    }
    
    .episode-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .episode-number {
      background: var(--primary-color);
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
    }
    
    .episode-card h4 {
      margin: 0;
    }
    
    .episode-card p {
      margin: 8px 0 0 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
  `]
})
export class SeriesDetailComponent implements OnInit {
  series = signal<Series | null>(null);
  episodes = signal<Episode[]>([]);
  loading = signal(false);
  
  constructor(
    private route: ActivatedRoute,
    private vodService: VodService,
    private router: Router
  ) {}
  
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSeries(id);
    this.loadEpisodes(id);
  }
  
  loadSeries(id: number) {
    this.loading.set(true);
    this.vodService.getSeriesDetail(id).subscribe({
      next: (response) => {
        this.series.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  loadEpisodes(seriesId: number) {
    this.vodService.getEpisodes(seriesId).subscribe({
      next: (response) => {
        this.episodes.set(response.data);
      }
    });
  }
  
  groupedEpisodes() {
    const grouped = new Map<number, Episode[]>();
    this.episodes().forEach(ep => {
      if (!grouped.has(ep.seasonNumber)) {
        grouped.set(ep.seasonNumber, []);
      }
      grouped.get(ep.seasonNumber)!.push(ep);
    });
    
    return Array.from(grouped.entries())
      .map(([number, episodes]) => ({ number, episodes }))
      .sort((a, b) => a.number - b.number);
  }
  
  playEpisode(episode: Episode) {
    this.router.navigate(['/player'], {
      queryParams: { url: episode.streamUrl, title: episode.title }
    });
  }
}
