import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ContentService } from '../../core/services/content.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { FilterService } from '../../core/services/filter.service';
import { Category, MediaItem, ContentType } from '../../core/models/content.model';
import { FilterOptions } from '../../core/models/filter.model';
import { FilterPanelComponent } from './filter-panel.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    FilterPanelComponent
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav mode="side" opened position="end" class="filter-sidenav">
        <app-filter-panel (filtersApplied)="onFiltersApplied($event)"></app-filter-panel>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <div class="content-container">
          <div class="header">
            <h1>Content</h1>
            <div class="actions">
              <button mat-icon-button routerLink="/search">
                <mat-icon>search</mat-icon>
              </button>
              <button mat-icon-button routerLink="/favorites">
                <mat-icon>favorite</mat-icon>
              </button>
              <button mat-icon-button (click)="themeService.toggleTheme()">
                <mat-icon>{{ themeService.currentTheme() === 'tivimate' ? 'dark_mode' : 'light_mode' }}</mat-icon>
              </button>
              <button mat-button routerLink="/accounts">
                <mat-icon>settings</mat-icon>
                Accounts
              </button>
              <button mat-button (click)="authService.logout()">
                <mat-icon>logout</mat-icon>
                Logout
              </button>
            </div>
          </div>

      <mat-tab-group (selectedTabChange)="onTabChange($event.index)">
        <mat-tab label="Live TV">
          <ng-template matTabContent>
            @if (loadingCategories()) {
              <div class="loading"><mat-spinner></mat-spinner></div>
            } @else {
              <div class="categories-grid">
                @for (cat of categories(); track cat.id) {
                  <mat-card (click)="selectCategory(cat.id)">
                    <mat-card-content>
                      <h3>{{ cat.originalName }}</h3>
                      <p>{{ cat.itemCount }} channels</p>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Movies">
          <ng-template matTabContent>
            <div class="tab-actions">
              <button mat-raised-button color="primary" routerLink="/vod">
                <mat-icon>movie</mat-icon>
                Browse Movies
              </button>
            </div>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Series">
          <ng-template matTabContent>
            <div class="tab-actions">
              <button mat-raised-button color="primary" routerLink="/series">
                <mat-icon>tv</mat-icon>
                Browse Series
              </button>
            </div>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Radio">
          <ng-template matTabContent>
            @if (loadingCategories()) {
              <div class="loading"><mat-spinner></mat-spinner></div>
            } @else {
              <div class="categories-grid">
                @for (cat of categories(); track cat.id) {
                  <mat-card (click)="selectCategory(cat.id)">
                    <mat-card-content>
                      <h3>{{ cat.originalName }}</h3>
                      <p>{{ cat.itemCount }} stations</p>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </ng-template>
        </mat-tab>
      </mat-tab-group>

      @if (selectedCategoryId()) {
        <div class="items-section">
          <div class="section-header">
            <h2>Channels</h2>
            <button mat-button (click)="selectedCategoryId.set(null)">
              <mat-icon>close</mat-icon>
              Close
            </button>
          </div>
          
          @if (loadingItems()) {
            <div class="loading"><mat-spinner></mat-spinner></div>
          } @else {
            <div class="items-grid">
              @for (item of items(); track item.id) {
                <mat-card class="item-card" (click)="playItem(item)">
                  @if (item.logo) {
                    <img [src]="item.logo" [alt]="item.name">
                  }
                  <mat-card-content>
                    <h4>{{ item.name }}</h4>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          }
        </div>
      }
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    mat-sidenav-container {
      height: 100vh;
    }
    
    .filter-sidenav {
      width: 300px;
      padding: 16px;
    }
    
    .content-container {
      padding: 20px;
      height: 100%;
      overflow-y: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px 0;
    }

    .categories-grid mat-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .categories-grid mat-card:hover {
      transform: scale(1.05);
    }

    .items-section {
      margin-top: 40px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }

    .item-card {
      cursor: pointer;
      text-align: center;
    }

    .item-card img {
      width: 100%;
      height: 100px;
      object-fit: contain;
      background: #000;
    }

    .item-card h4 {
      margin: 8px 0;
      font-size: 14px;
    }
    
    .tab-actions {
      padding: 40px;
      display: flex;
      justify-content: center;
    }
  `]
})
export class ContentComponent implements OnInit {
  categories = signal<Category[]>([]);
  items = signal<MediaItem[]>([]);
  selectedCategoryId = signal<number | null>(null);
  loadingCategories = signal(false);
  loadingItems = signal(false);
  currentType: ContentType = 'LIVE';

  constructor(
    private contentService: ContentService,
    private filterService: FilterService,
    private router: Router,
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loadingCategories.set(true);
    this.contentService.getCategories(this.currentType).subscribe({
      next: (response) => {
        this.categories.set(response.data || []);
        this.loadingCategories.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories.set([]);
        this.loadingCategories.set(false);
      }
    });
  }

  onTabChange(index: number) {
    const types: ContentType[] = ['LIVE', 'VOD', 'SERIES', 'RADIO'];
    this.currentType = types[index];
    this.selectedCategoryId.set(null);
    this.loadCategories();
  }

  selectCategory(categoryId: number) {
    this.selectedCategoryId.set(categoryId);
    this.loadingItems.set(true);
    
    this.contentService.getItemsByCategory(categoryId).subscribe({
      next: (response) => {
        this.items.set(response.data.content);
        this.loadingItems.set(false);
      },
      error: () => {
        this.loadingItems.set(false);
      }
    });
  }
  
  onFiltersApplied(filters: FilterOptions) {
    this.loadingItems.set(true);
    this.filterService.getFilteredItems(filters).subscribe({
      next: (response) => {
        this.items.set(response.data);
        this.selectedCategoryId.set(null);
        this.loadingItems.set(false);
      },
      error: () => {
        this.loadingItems.set(false);
      }
    });
  }
  
  playItem(item: MediaItem) {
    this.router.navigate(['/player'], {
      queryParams: { url: item.streamUrl, title: item.name }
    });
  }
}
