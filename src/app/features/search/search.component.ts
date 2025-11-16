import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchService } from '../../core/services/search.service';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { MediaItem } from '../../core/models/content.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    SearchBarComponent
  ],
  template: `
    <div class="search-container">
      <h2>Search</h2>
      <app-search-bar (searchTriggered)="onSearch($event)"></app-search-bar>
      
      @if (loading()) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else if (results().length > 0) {
        <div class="results-grid">
          @for (item of results(); track item.id) {
            <mat-card class="result-card" (click)="playItem(item)">
              @if (item.logo) {
                <img [src]="item.logo" [alt]="item.name">
              }
              <mat-card-content>
                <h4>{{ item.name }}</h4>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else if (searched()) {
        <p class="no-results">No results found</p>
      }
    </div>
  `,
  styles: [`
    .search-container {
      padding: 20px;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }
    
    .result-card {
      cursor: pointer;
      text-align: center;
      transition: transform 0.2s;
    }
    
    .result-card:hover {
      transform: scale(1.05);
    }
    
    .result-card img {
      width: 100%;
      height: 100px;
      object-fit: contain;
      background: #000;
    }
    
    .result-card h4 {
      margin: 8px 0;
      font-size: 14px;
    }
    
    .no-results {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class SearchComponent {
  results = signal<MediaItem[]>([]);
  loading = signal(false);
  searched = signal(false);
  
  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}
  
  onSearch(query: string) {
    this.loading.set(true);
    this.searched.set(true);
    
    this.searchService.search(query).subscribe({
      next: (response) => {
        this.results.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  playItem(item: MediaItem) {
    this.router.navigate(['/player'], {
      queryParams: { url: item.streamUrl, title: item.name }
    });
  }
}
