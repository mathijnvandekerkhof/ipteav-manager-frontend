import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../core/services/account.service';
import { AccountRequest } from '../../core/models/account.model';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEdit() ? 'Edit' : 'Add' }} IPTV Account</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Account Name</mat-label>
              <input matInput [(ngModel)]="account.name" name="name" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Host</mat-label>
              <input matInput [(ngModel)]="account.host" name="host" required>
              <mat-hint>e.g., example.com</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Port</mat-label>
              <input matInput type="number" [(ngModel)]="account.port" name="port" required>
              <mat-hint>Usually 8080</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="account.username" name="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="account.password" name="password" required>
            </mat-form-field>

            @if (error()) {
              <div class="error">{{ error() }}</div>
            }

            <div class="actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
                {{ loading() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    mat-card {
      width: 100%;
      max-width: 500px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    .error {
      color: #f44336;
      font-size: 14px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class AccountFormComponent implements OnInit {
  account: AccountRequest = {
    name: '',
    host: '',
    port: 8080,
    username: '',
    password: ''
  };

  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  accountId?: number;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.accountId = +id;
      this.loadAccount(this.accountId);
    }
  }

  loadAccount(id: number) {
    this.accountService.getAccount(id).subscribe({
      next: (response) => {
        const acc = response.data;
        this.account = {
          name: acc.name,
          host: acc.host,
          port: acc.port,
          username: acc.username,
          password: '' // Don't load password
        };
      }
    });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    const request = this.isEdit() && this.accountId
      ? this.accountService.updateAccount(this.accountId, this.account)
      : this.accountService.createAccount(this.account);

    request.subscribe({
      next: () => {
        this.router.navigate(['/accounts']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to save account');
      }
    });
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
