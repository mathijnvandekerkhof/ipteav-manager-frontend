import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  type: 'LIVE' | 'VOD' | 'SERIES' | 'RADIO';
  itemCount: number;
  parentName?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  itemCount: number;
  parentId: number;
  groupName?: string;
}

// Backend response interface
interface CategoryResponse {
  id: number;
  normalizedName: string;
  originalName: string;
  contentType: 'LIVE' | 'VOD' | 'SERIES' | 'RADIO';
  itemCount: number;
}

export interface MediaItem {
  id: number;
  name: string;
  streamUrl: string;
  logoUrl?: string;
  categoryId: number;
  type: 'LIVE' | 'VOD' | 'SERIES' | 'RADIO';
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  
  readonly categories = signal<Category[]>([]);
  readonly subCategories = signal<SubCategory[]>([]);
  readonly mediaItems = signal<MediaItem[]>([]);
  readonly loading = signal(false);
  readonly loadingStatus = signal('Loading content...');
  readonly currentPage = signal(0);
  readonly totalItems = signal(0);
  readonly hasMoreItems = signal(false);

  getCategories(type?: string): Observable<Category[]> {
    // Don't reload if we already have categories and no type filter
    if (!type && this.categories().length > 0) {
      return new Observable(observer => {
        observer.next(this.categories());
        observer.complete();
      });
    }
    
    this.loading.set(true);
    this.loadingStatus.set('Fetching categories from server...');
    const params = type ? `?type=${type}` : '';
    
    return this.http.get<{success: boolean, data: CategoryResponse[]}>(`${environment.apiUrl}/content/categories${params}`)
      .pipe(
        tap(response => {
          console.log('Raw API response:', response);
          this.loadingStatus.set('Processing categories...');
        }),
        map(response => {
          const categories = response.data || [];
          // Group by normalized name and content type to avoid duplicates
          const grouped = categories.reduce((acc, cat) => {
            const key = `${cat.normalizedName}-${cat.contentType}`;
            if (!acc[key]) {
              acc[key] = {
                id: cat.id,
                name: cat.normalizedName || cat.originalName,
                type: cat.contentType,
                itemCount: cat.itemCount
              };
            } else {
              // Sum up item counts for duplicate categories
              acc[key].itemCount += cat.itemCount;
            }
            return acc;
          }, {} as Record<string, Category>);
          return Object.values(grouped);
        }),
        tap(categories => {
          console.log('Mapped categories:', categories);
          console.log('First category:', categories[0]);
          this.loadingStatus.set('Finalizing...');
          this.categories.set(categories);
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          throw error;
        })
      );
  }

  getCategoryItems(categoryId: number, page = 0, size = 100, groupName?: string): Observable<MediaItem[]> {
    this.loading.set(true);
    this.loadingStatus.set(`Loading items (page ${page + 1})...`);
    
    const url = groupName 
      ? `${environment.apiUrl}/content/categories/${categoryId}/groups/${encodeURIComponent(groupName)}/items?page=${page}&size=${size}`
      : `${environment.apiUrl}/content/categories/${categoryId}/items?page=${page}&size=${size}`;
    
    return this.http.get<{success: boolean, data: {content: MediaItem[], totalElements: number, totalPages: number, last: boolean}}>(url)
      .pipe(
        map(response => {
          const data = response.data;
          this.totalItems.set(data?.totalElements || 0);
          this.currentPage.set(page);
          this.hasMoreItems.set(!data?.last);
          return data?.content || [];
        }),
        tap(items => {
          this.loadingStatus.set('Processing items...');
          if (page === 0) {
            this.mediaItems.set(items);
          } else {
            // Append items for pagination
            this.mediaItems.update(current => [...current, ...items]);
          }
          this.loading.set(false);
        })
      );
  }

  loadMoreItems(categoryId: number, groupName?: string): Observable<MediaItem[]> {
    return this.getCategoryItems(categoryId, this.currentPage() + 1, 100, groupName);
  }

  getSubCategories(parentCategoryId: number): Observable<SubCategory[]> {
    this.loading.set(true);
    this.loadingStatus.set('Loading groups...');
    return this.http.get<{success: boolean, data: any[]}>(`${environment.apiUrl}/content/categories/${parentCategoryId}/groups`)
      .pipe(
        map(response => {
          const groups = response.data || [];
          return groups.map(group => ({
            id: parentCategoryId, // Use parent category ID
            name: group.displayName,
            itemCount: group.itemCount,
            parentId: parentCategoryId,
            groupName: group.groupName // Store original group name for API calls
          }));
        }),
        tap(subcategories => {
          this.subCategories.set(subcategories);
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          throw error;
        })
      );
  }

  getMediaItem(id: number): Observable<MediaItem> {
    return this.http.get<{success: boolean, data: MediaItem}>(`${environment.apiUrl}/content/items/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  refreshContent(): Observable<void> {
    this.loading.set(true);
    this.loadingStatus.set('Triggering content refresh...');
    return this.http.post<void>(`${environment.apiUrl}/content/refresh`, {})
      .pipe(
        tap(() => {
          this.loadingStatus.set('Refresh initiated, syncing in background...');
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          throw error;
        })
      );
  }
}