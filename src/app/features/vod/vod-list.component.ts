import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { VodService } from '../../core/services/vod.service';
import { VodItem } from '../../core/models/vod.model';

@Component({
  selector: 'app-vod-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="vod-container">
      <div class="header">
        <h2>Movies</h2>
        <div class="filters">
          <mat-form-field>
            <mat-label>Quality</mat-label>
            <mat-select [(ngModel)]="quality" (selectionChange)="loadVod()">
              <mat-option [value]="undefined">All</mat-option>
              <mat-option value="4K">4K</mat-option>
              <mat-option value="FHD">FHD</mat-option>
              <mat-option value="HD">HD</mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field>
            <mat-label>Platform</mat-label>
            <mat-select [(ngModel)]="platform" (selectionChange)="loadVod()">
              <mat-option [value]="undefined">All</mat-option>
              <mat-option value="Netflix">Netflix</mat-option>
              <mat-option value="Prime">Prime</mat-option>
              <mat-option value="Disney+">Disney+</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
      
      @if (loading()) {
        <div class="loading"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="vod-grid">
          @for (item of items(); track item.id) {
            <mat-card class="vod-card" (click)="openDetail(item.id)">
              @if (item.logo) {
                <img [src]="item.logo" [alt]="item.name">
              }
              <mat-card-content>
                <h3>{{ item.name }}</h3>
                @if (item.rating) {
                  <div class="rating">
                    <mat-icon>star</mat-icon>
                    {{ item.rating }}
                  </div>
                }
                @if (item.quality) {
                  <span class="quality-badge">{{ item.quality }}</span>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .vod-container {
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .filters {
      display: flex;
      gap: 16px;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    
    .vod-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .vod-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .vod-card:hover {
      transform: scale(1.05);
    }
    
    .vod-card img {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }
    
    .vod-card h3 {
      margin: 8px 0;
      font-size: 16px;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffc107;
      font-size: 14px;
    }
    
    .rating mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .quality-badge {
      display: inline-block;
      padding: 2px 8px;
      background: var(--primary-color);
      border-radius: 4px;
      font-size: 12px;
      margin-top: 4px;
    }
  `]
})
export class VodListComponent implements OnInit {
  items = signal<VodItem[]>([]);
  loading = signal(false);
  quality?: string;
  platform?: string;
  
  constructor(
    private vodService: VodService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadVod();
  }
  
  loadVod() {
    this.loading.set(true);
    const params: any = { page: 0, size: 999999 };
    if (this.quality) params.quality = this.quality;
    if (this.platform) params.platform = this.platform;
    
    this.vodService.getVodItems(params).subscribe({
      next: (response) => {
        this.items.set(response.data.content || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  openDetail(id: number) {
    this.router.navigate(['/vod', id]);
  }
}
