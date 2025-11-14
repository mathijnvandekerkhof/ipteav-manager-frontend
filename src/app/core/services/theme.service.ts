import { Injectable, signal, computed, effect, inject, DestroyRef } from '@angular/core';

export enum AppTheme {
  SMARTERS = 'smarters',
  TIVIMATE = 'tivimate'
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly destroyRef = inject(DestroyRef);
  
  readonly currentTheme = signal<AppTheme>(
    this.getStoredTheme() || AppTheme.SMARTERS
  );

  readonly isDarkMode = computed(() => 
    this.currentTheme() !== AppTheme.SMARTERS
  );

  constructor() {
    // Apply initial theme
    document.body.className = `theme-${this.currentTheme()}`;
    
    // Watch for theme changes
    this.destroyRef.onDestroy(() => {
      // Cleanup if needed
    });
  }
  
  private applyTheme(): void {
    document.body.className = `theme-${this.currentTheme()}`;
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('app-theme', theme);
    this.applyTheme();
  }

  private getStoredTheme(): AppTheme | null {
    return localStorage.getItem('app-theme') as AppTheme;
  }
}
