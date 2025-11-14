import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer.component';
import { SyncService } from './core/services/sync.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  template: `
    <div class="app-container">
      <router-outlet />
    </div>
    <app-footer />
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      padding-bottom: 50px; /* Space for footer */
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'IPTeaV Manager';
  
  private readonly syncService = inject(SyncService);
  private readonly authService = inject(AuthService);
  
  ngOnInit(): void {
    // Auto-connect WebSocket when user is authenticated
    if (this.authService.isAuthenticated()) {
      this.syncService.connect();
    }
  }
}
