import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Category, MediaItem } from '../../core/services/content.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-container">
      <div class="header">
        <h2>IPTV Content</h2>
        <div class="actions">
          <select (change)="onTypeChange($event)" class="type-filter">
            <option value="">All Types</option>
            <option value="LIVE">Live TV</option>
            <option value="VOD">Movies</option>
            <option value="SERIES">Series</option>
            <option value="RADIO">Radio</option>
          </select>
          <button (click)="refreshContent()" class="refresh-btn">Refresh</button>
        </div>
      </div>

      @if (contentService.loading()) {
        <div class="loading">Loading content...</div>
      }

      <div class="content-grid">
        @for (category of contentService.categories(); track category.id) {
          <div class="category-card" (click)="selectCategory(category)">
            <h3>{{ category.name }}</h3>
            <p class="item-count">{{ category.itemCount }} items</p>
            <span class="type-badge" [class]="'type-' + category.type.toLowerCase()">
              {{ category.type }}
            </span>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No content available</p>
            <p>1. Make sure you have an active IPTV account</p>
            <p>2. Click 'Refresh' to sync content from your provider</p>
            <button (click)="refreshContent()" class="refresh-btn">Refresh Content</button>
          </div>
        }
      </div>

      @if (selectedCategory()) {
        <div class="media-items">
          <div class="section-header">
            <h3>{{ selectedCategory()?.name }} - {{ selectedCategory()?.type }}</h3>
            <button (click)="selectedCategory.set(null)" class="close-btn">×</button>
          </div>
          
          <div class="items-grid">
            @for (item of contentService.mediaItems(); track item.id) {
              <div class="media-item" (click)="playItem(item)">
                @if (item.logoUrl) {
                  <img [src]="item.logoUrl" [alt]="item.name" class="item-logo">
                } @else {
                  <div class="item-placeholder">{{ item.name.charAt(0) }}</div>
                }
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                </div>
              </div>
            } @empty {
              <div class="empty-items">No items in this category</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .content-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .actions { display: flex; gap: 1rem; align-items: center; }
    .type-filter { padding: 8px 12px; background: var(--surface, #1e1e1e); color: white; border: 1px solid #333; border-radius: 4px; }
    .refresh-btn { padding: 8px 16px; background: var(--primary, #1976d2); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .category-card { background: var(--surface, #1e1e1e); padding: 1.5rem; border-radius: 8px; cursor: pointer; transition: transform 0.2s; position: relative; }
    .category-card:hover { transform: translateY(-2px); }
    .category-card h3 { margin: 0 0 0.5rem 0; color: var(--primary, #1976d2); }
    .item-count { margin: 0; color: #ccc; font-size: 0.9rem; }
    .type-badge { position: absolute; top: 1rem; right: 1rem; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
    .type-live { background: #f44336; color: white; }
    .type-vod { background: #2196f3; color: white; }
    .type-series { background: #ff9800; color: white; }
    .type-radio { background: #4caf50; color: white; }
    .media-items { background: var(--surface, #1e1e1e); padding: 2rem; border-radius: 8px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .close-btn { background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer; }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .media-item { background: var(--background, #121212); padding: 1rem; border-radius: 6px; cursor: pointer; text-align: center; transition: transform 0.2s; }
    .media-item:hover { transform: scale(1.02); }
    .item-logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 0.5rem; }
    .item-placeholder { width: 60px; height: 60px; background: var(--primary, #1976d2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 0.5rem; }
    .item-info h4 { margin: 0; font-size: 0.9rem; color: white; }
    .loading, .empty-state, .empty-items { text-align: center; padding: 3rem; color: #666; }
  `]
})
export class ContentComponent implements OnInit {
  readonly contentService = inject(ContentService);
  readonly selectedCategory = signal<Category | null>(null);

  ngOnInit(): void {
    this.contentService.getCategories().subscribe({
      error: (error) => {
        console.error('Failed to load content:', error);
        this.contentService.loading.set(false);
      }
    });
  }

  onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value;
    this.contentService.getCategories(type || undefined).subscribe();
  }

  selectCategory(category: Category): void {
    this.selectedCategory.set(category);
    this.contentService.getCategoryItems(category.id).subscribe();
  }

  playItem(item: MediaItem): void {
    console.log('Playing:', item.name, item.streamUrl);
    // TODO: Implement video player
  }

  refreshContent(): void {
    this.contentService.refreshContent().subscribe({
      next: () => {
        console.log('Content refreshed successfully');
        this.contentService.getCategories().subscribe({
          error: (error) => {
            console.error('Failed to load content after refresh:', error);
            this.contentService.loading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Failed to refresh content:', error);
        this.contentService.loading.set(false);
        alert('Failed to refresh content. Make sure you have an active IPTV account.');
      }
    });
  }
}