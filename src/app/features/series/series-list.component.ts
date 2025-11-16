import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VodService } from '../../core/services/vod.service';
import { Series } from '../../core/models/vod.model';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="series-container">
      <h2>Series</h2>
      
      @if (loading()) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="series-grid">
          @for (item of items(); track item.id) {
            <mat-card class="series-card" (click)="openDetail(item.id)">
              @if (item.logo) {
                <img [src]="item.logo" [alt]="item.name">
              }
              <mat-card-content>
                <h3>{{ item.name }}</h3>
                @if (item.episodeCount) {
                  <p>{{ item.episodeCount }} episodes</p>
                }
                @if (item.rating) {
                  <div class="rating">
                    <mat-icon>star</mat-icon>
                    {{ item.rating }}
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .series-container {
      padding: 20px;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .series-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .series-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .series-card:hover {
      transform: scale(1.05);
    }
    
    .series-card img {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }
    
    .series-card h3 {
      margin: 8px 0;
      font-size: 16px;
    }
    
    .series-card p {
      margin: 4px 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffc107;
      font-size: 14px;
    }
    
    .rating mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class SeriesListComponent implements OnInit {
  items = signal<Series[]>([]);
  loading = signal(false);
  
  constructor(
    private vodService: VodService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadSeries();
  }
  
  loadSeries() {
    this.loading.set(true);
    this.vodService.getSeries({ page: 0, size: 999999 }).subscribe({
      next: (response) => {
        this.items.set(response.data.content || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  openDetail(id: number) {
    this.router.navigate(['/series', id]);
  }
}
