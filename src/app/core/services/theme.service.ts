import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'tivimate' | 'smarters';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  
  currentTheme = signal<Theme>(this.getThemeFromStorage());

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      document.body.className = `theme-${theme}`;
      localStorage.setItem(this.THEME_KEY, theme);
    });
  }

  toggleTheme() {
    this.currentTheme.update(current => 
      current === 'tivimate' ? 'smarters' : 'tivimate'
    );
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  private getThemeFromStorage(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY);
    return (stored === 'smarters' || stored === 'tivimate') ? stored : 'tivimate';
  }
}
