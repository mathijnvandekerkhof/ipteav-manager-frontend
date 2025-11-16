import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category, MediaItem, ContentType } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private apiUrl = `${environment.apiUrl}/content`;

  constructor(private http: HttpClient) {}

  getCategories(type: ContentType = 'LIVE') {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories?type=${type}`);
  }

  getItemsByCategory(categoryId: number, page: number = 0, size: number = 50) {
    return this.http.get<{ success: boolean; data: { content: MediaItem[] } }>
      (`${this.apiUrl}/categories/${categoryId}/items?page=${page}&size=${size}`);
  }
}
