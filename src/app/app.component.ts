import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner.component';
import { FooterComponent } from './shared/components/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent, FooterComponent],
  template: `
    <app-loading-spinner />
    <router-outlet />
    <app-footer />
  `,
  styles: []
})
export class AppComponent {
  title = 'IPTeaV Manager';
}
