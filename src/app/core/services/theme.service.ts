import { Injectable, signal, computed, effect } from '@angular/core';

export enum AppTheme {
  SMARTERS = 'smarters',
  TIVIMATE = 'tivimate'
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly currentTheme = signal<AppTheme>(
    this.getStoredTheme() || AppTheme.SMARTERS
  );

  readonly isDarkMode = computed(() => 
    this.currentTheme() !== AppTheme.SMARTERS
  );

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      document.body.className = `theme-${theme}`;
    });
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('app-theme', theme);
  }

  private getStoredTheme(): AppTheme | null {
    return localStorage.getItem('app-theme') as AppTheme;
  }
}
