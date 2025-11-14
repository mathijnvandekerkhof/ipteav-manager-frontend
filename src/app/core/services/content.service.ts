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

export interface Prefix {
  prefix: string;
  groupCount: number;
  totalItemCount: number;
}

export interface Group {
  groupName: string;
  displayName: string;
  itemCount: number;
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
  
  readonly prefixes = signal<Prefix[]>([]);
  readonly groups = signal<Group[]>([]);
  readonly mediaItems = signal<MediaItem[]>([]);
  readonly loading = signal(false);
  readonly loadingStatus = signal('Loading content...');
  readonly currentPage = signal(0);
  readonly totalItems = signal(0);
  readonly hasMoreItems = signal(false);

  // Niveau 1: Get prefixes
  getPrefixes(type: string = 'LIVE'): Observable<Prefix[]> {
    this.loading.set(true);
    this.loadingStatus.set('Loading prefixes...');
    
    return this.http.get<{success: boolean, data: Prefix[]}>(`${environment.apiUrl}/content/prefixes?type=${type}`)
      .pipe(
        tap(response => {
          this.prefixes.set(response.data || []);
          this.loading.set(false);
        }),
        map(response => response.data || []),
        catchError(error => {
          this.loading.set(false);
          throw error;
        })
      );
  }

  // Niveau 2: Get groups within a prefix
  getGroupsByPrefix(prefix: string, type: string = 'LIVE'): Observable<Group[]> {
    this.loading.set(true);
    this.loadingStatus.set('Loading groups...');
    
    return this.http.get<{success: boolean, data: Group[]}>(
      `${environment.apiUrl}/content/prefixes/${encodeURIComponent(prefix)}/groups?type=${type}`
    ).pipe(
      tap(response => {
        this.groups.set(response.data || []);
        this.loading.set(false);
      }),
      map(response => response.data || []),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }
  
  // Niveau 3: Get items within a group
  getItemsByGroup(groupTag: string, type: string = 'LIVE', page = 0, size = 50): Observable<MediaItem[]> {
    this.loading.set(true);
    this.loadingStatus.set(`Loading items (page ${page + 1})...`);
    
    return this.http.get<{success: boolean, data: {content: MediaItem[], totalElements: number, totalPages: number, last: boolean}}>(
      `${environment.apiUrl}/content/groups/${encodeURIComponent(groupTag)}/items?type=${type}&page=${page}&size=${size}`
    ).pipe(
      map(response => {
        const data = response.data;
        this.totalItems.set(data?.totalElements || 0);
        this.currentPage.set(page);
        this.hasMoreItems.set(!data?.last);
        return data?.content || [];
      }),
      tap(items => {
        if (page === 0) {
          this.mediaItems.set(items);
        } else {
          this.mediaItems.update(current => [...current, ...items]);
        }
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  loadMoreItems(groupTag: string, type: string = 'LIVE'): Observable<MediaItem[]> {
    return this.getItemsByGroup(groupTag, type, this.currentPage() + 1);
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