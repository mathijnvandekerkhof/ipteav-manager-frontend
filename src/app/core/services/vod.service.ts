import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VodItem, Series, Episode } from '../models/vod.model';

@Injectable({
  providedIn: 'root'
})
export class VodService {
  private apiUrl = `${environment.apiUrl}/content`;
  
  constructor(private http: HttpClient) {}
  
  getVodItems(params?: any) {
    return this.http.get<any>(`${this.apiUrl}/vod`, { params });
  }
  
  getVodDetail(id: number) {
    return this.http.get<any>(`${this.apiUrl}/vod/${id}`);
  }
  
  getSeries(params?: any) {
    return this.http.get<any>(`${this.apiUrl}/series`, { params });
  }
  
  getSeriesDetail(id: number) {
    return this.http.get<any>(`${this.apiUrl}/series/${id}`);
  }
  
  getEpisodes(seriesId: number, seasonNumber?: number) {
    const url = seasonNumber 
      ? `${this.apiUrl}/series/${seriesId}/episodes/season/${seasonNumber}`
      : `${this.apiUrl}/series/${seriesId}/episodes`;
    return this.http.get<any>(url);
  }
}
