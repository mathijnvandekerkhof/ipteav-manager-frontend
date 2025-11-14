import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <h1>IPTeaV Manager</h1>
      <p>Frontend setup compleet! 🚀</p>
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-container {
      padding: 2rem;
      text-align: center;
    }
    h1 {
      color: #1976d2;
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class App {
  title = 'IPTeaV Manager';
}
