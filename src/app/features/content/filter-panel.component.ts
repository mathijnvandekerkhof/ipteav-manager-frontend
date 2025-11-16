import { Component, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FilterService } from '../../core/services/filter.service';
import { FilterOptions } from '../../core/models/filter.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule
  ],
  template: `
    <div class="filter-panel">
      <h3>Filters</h3>
      
      <mat-form-field>
        <mat-label>Prefix</mat-label>
        <input matInput [(ngModel)]="filters.prefix" placeholder="NL, BE, UK...">
      </mat-form-field>
      
      <mat-form-field>
        <mat-label>Quality</mat-label>
        <mat-select [(ngModel)]="filters.quality">
          <mat-option [value]="undefined">All</mat-option>
          <mat-option *ngFor="let q of qualities" [value]="q">{{q}}</mat-option>
        </mat-select>
      </mat-form-field>
      
      <mat-form-field>
        <mat-label>Provider</mat-label>
        <mat-select [(ngModel)]="filters.provider">
          <mat-option [value]="undefined">All</mat-option>
          <mat-option *ngFor="let p of providers" [value]="p">{{p}}</mat-option>
        </mat-select>
      </mat-form-field>
      
      <div class="checkboxes">
        <mat-checkbox [(ngModel)]="filters.ppvOnly">PPV Only</mat-checkbox>
        <mat-checkbox [(ngModel)]="filters.replayOnly">Replay Only</mat-checkbox>
      </div>
      
      <div class="actions">
        <button mat-raised-button color="primary" (click)="apply()">Apply</button>
        <button mat-button (click)="clear()">Clear</button>
      </div>
    </div>
  `,
  styles: [`
    .filter-panel {
      padding: 16px;
      background: var(--surface-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    h3 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .checkboxes {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  `]
})
export class FilterPanelComponent implements OnInit {
  filtersApplied = output<FilterOptions>();
  
  filters: FilterOptions = {};
  providers: string[] = [];
  qualities: string[] = [];
  
  constructor(private filterService: FilterService) {}
  
  ngOnInit() {
    this.filterService.getProviders().subscribe(p => this.providers = p);
    this.filterService.getQualities().subscribe(q => this.qualities = q);
  }
  
  apply() {
    this.filterService.updateFilters(this.filters);
    this.filtersApplied.emit(this.filters);
  }
  
  clear() {
    this.filters = {};
    this.filterService.clearFilters();
    this.filtersApplied.emit(this.filters);
  }
}
