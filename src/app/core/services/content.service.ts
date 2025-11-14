import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  type: 'LIVE' | 'VOD' | 'SERIES' | 'RADIO';
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
  readonly mediaItems = signal<MediaItem[]>([]);
  readonly loading = signal(false);

  getCategories(type?: string): Observable<Category[]> {
    this.loading.set(true);
    const params = type ? `?type=${type}` : '';
    
    return this.http.get<{success: boolean, data: Category[]}>(`${environment.apiUrl}/content/categories${params}`)
      .pipe(
        map(response => response.data || []),
        tap(categories => {
          this.categories.set(categories);
          this.loading.set(false);
        })
      );
  }

  getCategoryItems(categoryId: number, page = 0, size = 50): Observable<MediaItem[]> {
    return this.http.get<{success: boolean, data: MediaItem[]}>(`${environment.apiUrl}/content/categories/${categoryId}/items?page=${page}&size=${size}`)
      .pipe(
        map(response => response.data || []),
        tap(items => this.mediaItems.set(items))
      );
  }

  getMediaItem(id: number): Observable<MediaItem> {
    return this.http.get<{success: boolean, data: MediaItem}>(`${environment.apiUrl}/content/items/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  refreshContent(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/content/refresh`, {});
  }
}