import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  
  constructor(private http: HttpClient) {}
  
  addFavorite(mediaItemId: number) {
    return this.http.post<any>(`${this.apiUrl}/${mediaItemId}`, {});
  }
  
  removeFavorite(mediaItemId: number) {
    return this.http.delete<any>(`${this.apiUrl}/${mediaItemId}`);
  }
  
  getFavorites(page = 0, size = 20) {
    return this.http.get<any>(this.apiUrl, { params: { page, size } });
  }
  
  isFavorite(mediaItemId: number) {
    return this.http.get<any>(`${this.apiUrl}/${mediaItemId}/check`);
  }
  
  getCount() {
    return this.http.get<any>(`${this.apiUrl}/count`);
  }
}
