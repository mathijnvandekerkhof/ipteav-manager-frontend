import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;
  
  constructor(private http: HttpClient) {}
  
  search(query: string, type?: string, categoryId?: number) {
    const params: any = { query };
    if (type) params.type = type;
    if (categoryId) params.categoryId = categoryId;
    return this.http.get<any>(this.apiUrl, { params });
  }
  
  getSuggestions(query: string) {
    return this.http.get<any>(`${this.apiUrl}/suggestions`, { params: { query } });
  }
}
