import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, Prefix, Group, MediaItem } from '../../core/services/content.service';
import { SyncService } from '../../core/services/sync.service';
import { SyncStatusComponent } from '../../shared/components/sync-status/sync-status.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, SyncStatusComponent],
  template: `
    <div class="content-container">
      <app-sync-status></app-sync-status>
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

      <!-- Breadcrumbs -->
      @if (breadcrumbs().length > 1) {
        <div class="breadcrumbs">
          @for (crumb of breadcrumbs(); track crumb.name; let isLast = $last) {
            <span class="breadcrumb" [class.active]="isLast" (click)="!isLast && crumb.action()">
              {{ crumb.name }}
            </span>
            @if (!isLast) {
              <span class="separator">></span>
            }
          }
        </div>
      }

      @if (contentService.loading()) {
        <div class="loading">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <span class="loading-text">{{ contentService.loadingStatus() }}</span>
          </div>
        </div>
      }

      <!-- Niveau 1: Prefixes -->
      @if (!selectedPrefix() && !selectedGroup()) {
        <div class="content-grid">
          @for (prefix of contentService.prefixes(); track prefix.prefix) {
            <div class="category-card" (click)="selectPrefix(prefix)">
              <h3>{{ prefix.prefix }}</h3>
              <p class="item-count">{{ prefix.groupCount }} groepen • {{ prefix.totalItemCount }} items</p>
              <span class="type-badge type-live">Prefix</span>
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
      }
      
      <!-- Niveau 2: Groups within prefix -->
      @if (selectedPrefix() && !selectedGroup()) {
        <div class="content-grid">
          @for (group of contentService.groups(); track group.groupName) {
            <div class="category-card" (click)="selectGroup(group)">
              <h3>{{ group.displayName }}</h3>
              <p class="item-count">{{ group.itemCount }} kanalen</p>
              <span class="type-badge type-subcategory">Groep</span>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No groups in this prefix</p>
            </div>
          }
        </div>
      }

      <!-- Niveau 3: Items within group -->
      @if (selectedGroup()) {
        <div class="media-items">
          <div class="section-header">
            <h3>{{ selectedGroup()?.displayName }}</h3>
            <button (click)="goBack()" class="close-btn">×</button>
          </div>
          
          <div class="pagination-info">
            <span>Showing {{ contentService.mediaItems().length }} of {{ contentService.totalItems() }} items</span>
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
          
          @if (contentService.hasMoreItems()) {
            <div class="load-more">
              <button (click)="loadMoreItems()" class="load-more-btn" [disabled]="contentService.loading()">
                {{ contentService.loading() ? 'Loading...' : 'Load More Items' }}
              </button>
            </div>
          }
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
    .type-unknown { background: #666; color: white; }
    .type-subcategory { background: #9c27b0; color: white; }
    .breadcrumbs { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--surface, #1e1e1e); border-radius: 8px; }
    .breadcrumb { color: var(--primary, #1976d2); cursor: pointer; font-weight: 500; }
    .breadcrumb.active { color: #ccc; cursor: default; }
    .breadcrumb:hover:not(.active) { text-decoration: underline; }
    .separator { color: #666; margin: 0 0.25rem; }
    .media-items { background: var(--surface, #1e1e1e); padding: 2rem; border-radius: 8px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .close-btn { background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer; }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .media-item { background: var(--background, #121212); padding: 1rem; border-radius: 6px; cursor: pointer; text-align: center; transition: transform 0.2s; }
    .media-item:hover { transform: scale(1.02); }
    .item-logo { width: 60px; height: 60px; object-fit: contain; margin-bottom: 0.5rem; }
    .item-placeholder { width: 60px; height: 60px; background: var(--primary, #1976d2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 0.5rem; }
    .item-info h4 { margin: 0; font-size: 0.9rem; color: white; }
    .pagination-info { margin-bottom: 1rem; color: #ccc; font-size: 0.9rem; }
    .load-more { text-align: center; margin-top: 2rem; }
    .load-more-btn { padding: 12px 24px; background: var(--primary, #1976d2); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .load-more-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .loading, .empty-state, .empty-items { text-align: center; padding: 3rem; color: #666; }
    .progress-container { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .progress-bar { width: 200px; height: 4px; background: #333; border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary, #1976d2); width: 0; animation: progress 1.5s ease-in-out infinite; }
    .loading-text { color: #ccc; font-size: 0.9rem; }
    @keyframes progress { 0% { width: 0; } 50% { width: 70%; } 100% { width: 100%; } }
  `]
})
export class ContentComponent implements OnInit, OnDestroy {
  readonly contentService = inject(ContentService);
  readonly syncService = inject(SyncService);
  readonly selectedPrefix = signal<Prefix | null>(null);
  readonly selectedGroup = signal<Group | null>(null);
  readonly selectedType = signal<string>('LIVE');
  readonly breadcrumbs = signal<{name: string, action: () => void}[]>([]);

  ngOnInit(): void {
    this.syncService.connect();
    
    this.syncService.syncCompleted$.subscribe(() => {
      console.log('Sync completed, reloading prefixes...');
      this.loadPrefixes();
    });
    
    this.loadPrefixes();
  }
  
  private loadPrefixes(): void {
    this.contentService.getPrefixes(this.selectedType()).subscribe({
      next: (prefixes) => console.log('Prefixes loaded:', prefixes),
      error: (error) => console.error('Failed to load prefixes:', error)
    });
  }
  
  ngOnDestroy(): void {
    this.syncService.disconnect();
  }

  onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value || 'LIVE';
    this.selectedType.set(type);
    this.goToRoot();
    this.loadPrefixes();
  }

  selectPrefix(prefix: Prefix): void {
    this.selectedPrefix.set(prefix);
    this.updateBreadcrumbs([{name: prefix.prefix, action: () => this.goToRoot()}]);
    this.contentService.getGroupsByPrefix(prefix.prefix, this.selectedType()).subscribe();
  }

  selectGroup(group: Group): void {
    this.selectedGroup.set(group);
    const prefix = this.selectedPrefix();
    this.updateBreadcrumbs([
      {name: prefix?.prefix || '', action: () => this.goToRoot()},
      {name: group.displayName, action: () => this.goBack()}
    ]);
    this.contentService.getItemsByGroup(group.groupName, this.selectedType()).subscribe();
  }

  goBack(): void {
    if (this.selectedGroup()) {
      this.selectedGroup.set(null);
      this.contentService.mediaItems.set([]);
      const prefix = this.selectedPrefix();
      if (prefix) {
        this.updateBreadcrumbs([{name: prefix.prefix, action: () => this.goToRoot()}]);
      }
    } else if (this.selectedPrefix()) {
      this.goToRoot();
    }
  }

  goToRoot(): void {
    this.selectedPrefix.set(null);
    this.selectedGroup.set(null);
    this.contentService.mediaItems.set([]);
    this.contentService.groups.set([]);
    this.updateBreadcrumbs([]);
  }

  private updateBreadcrumbs(crumbs: {name: string, action: () => void}[]): void {
    this.breadcrumbs.set([{name: 'Content', action: () => this.goToRoot()}, ...crumbs]);
  }

  loadMoreItems(): void {
    const group = this.selectedGroup();
    if (group) {
      this.contentService.loadMoreItems(group.groupName, this.selectedType()).subscribe();
    }
  }

  playItem(item: MediaItem): void {
    console.log('Playing:', item.name, item.streamUrl);
    // TODO: Implement video player
  }

  refreshContent(): void {
    this.contentService.refreshContent().subscribe({
      next: () => {
        console.log('Content refresh triggered');
        // Content will be automatically reloaded when sync completes via WebSocket
      },
      error: (error) => {
        console.error('Failed to refresh content:', error);
        this.contentService.loading.set(false);
        alert('Failed to refresh content. Make sure you have an active IPTV account.');
      }
    });
  }
}