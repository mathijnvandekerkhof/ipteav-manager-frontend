import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FilterOptions, FilterMetadata } from '../models/filter.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private apiUrl = `${environment.apiUrl}/content/advanced`;
  
  filters = signal<FilterOptions>({});
  
  constructor(private http: HttpClient) {}
  
  updateFilters(filters: FilterOptions) {
    this.filters.set(filters);
  }
  
  clearFilters() {
    this.filters.set({});
  }
  
  getProviders() {
    return this.http.get<string[]>(`${this.apiUrl}/providers`);
  }
  
  getQualities() {
    return this.http.get<string[]>(`${this.apiUrl}/qualities`);
  }
  
  getTags() {
    return this.http.get<string[]>(`${this.apiUrl}/tags`);
  }
  
  getFilteredItems(filters: FilterOptions) {
    return this.http.get<any>(`${this.apiUrl}/filter`, { params: filters as any });
  }
}
