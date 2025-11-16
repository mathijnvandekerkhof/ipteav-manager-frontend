import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../../core/services/search.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  template: `
    <mat-form-field class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput 
        [(ngModel)]="query" 
        (ngModelChange)="onQueryChange($event)"
        (keyup.enter)="search()"
        placeholder="Search..."
        [matAutocomplete]="auto">
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelect($event.option.value)">
        @for (suggestion of suggestions(); track suggestion) {
          <mat-option [value]="suggestion">{{ suggestion }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    .search-field {
      width: 100%;
      max-width: 500px;
    }
  `]
})
export class SearchBarComponent {
  searchTriggered = output<string>();
  
  query = '';
  suggestions = signal<string[]>([]);
  private querySubject = new Subject<string>();
  
  constructor(private searchService: SearchService) {
    this.querySubject.pipe(debounceTime(300)).subscribe(q => {
      if (q.length >= 2) {
        this.searchService.getSuggestions(q).subscribe({
          next: (response) => this.suggestions.set(response.data)
        });
      } else {
        this.suggestions.set([]);
      }
    });
  }
  
  onQueryChange(query: string) {
    this.querySubject.next(query);
  }
  
  search() {
    if (this.query.trim()) {
      this.searchTriggered.emit(this.query);
    }
  }
  
  onSelect(value: string) {
    this.query = value;
    this.search();
  }
}
