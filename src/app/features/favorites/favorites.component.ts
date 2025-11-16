import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FavoritesService } from '../../core/services/favorites.service';
import { MediaItem } from '../../core/models/content.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="favorites-container">
      <h2>Favorites</h2>
      
      @if (loading()) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else if (favorites().length > 0) {
        <div class="favorites-grid">
          @for (item of favorites(); track item.id) {
            <mat-card class="favorite-card">
              <button mat-icon-button class="remove-btn" (click)="removeFavorite(item.id)">
                <mat-icon>close</mat-icon>
              </button>
              @if (item.logo) {
                <img [src]="item.logo" [alt]="item.name" (click)="playItem(item)">
              }
              <mat-card-content (click)="playItem(item)">
                <h4>{{ item.name }}</h4>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <p class="empty">No favorites yet</p>
      }
    </div>
  `,
  styles: [`
    .favorites-container {
      padding: 20px;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .favorite-card {
      position: relative;
      cursor: pointer;
      text-align: center;
      transition: transform 0.2s;
    }
    
    .favorite-card:hover {
      transform: scale(1.05);
    }
    
    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      z-index: 10;
      background: rgba(0,0,0,0.7);
      color: #fff;
    }
    
    .favorite-card img {
      width: 100%;
      height: 100px;
      object-fit: contain;
      background: #000;
    }
    
    .favorite-card h4 {
      margin: 8px 0;
      font-size: 14px;
    }
    
    .empty {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class FavoritesComponent implements OnInit {
  favorites = signal<MediaItem[]>([]);
  loading = signal(false);
  
  constructor(
    private favoritesService: FavoritesService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadFavorites();
  }
  
  loadFavorites() {
    this.loading.set(true);
    this.favoritesService.getFavorites().subscribe({
      next: (response) => {
        this.favorites.set(response.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  removeFavorite(id: number) {
    this.favoritesService.removeFavorite(id).subscribe({
      next: () => {
        this.favorites.set(this.favorites().filter(f => f.id !== id));
      }
    });
  }
  
  playItem(item: MediaItem) {
    this.router.navigate(['/player'], {
      queryParams: { url: item.streamUrl, title: item.name }
    });
  }
}
