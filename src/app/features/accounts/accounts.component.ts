import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  template: `
    <div class="accounts-container">
      <div class="header">
        <h1>IPTV Accounts</h1>
        <div class="actions">
          <button mat-icon-button (click)="themeService.toggleTheme()">
            <mat-icon>{{ themeService.currentTheme() === 'tivimate' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
          <button mat-button routerLink="/content">
            <mat-icon>tv</mat-icon>
            Content
          </button>
          <button mat-raised-button color="primary" (click)="addAccount()">
            <mat-icon>add</mat-icon>
            Add Account
          </button>
          <button mat-raised-button color="accent" (click)="importJson()">
            <mat-icon>upload</mat-icon>
            Import JSON
          </button>
          <button mat-button (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (accounts().length === 0) {
        <mat-card>
          <mat-card-content>
            <p>No accounts yet. Add your first IPTV account to get started.</p>
            <button mat-raised-button color="primary" (click)="addAccount()">
              <mat-icon>add</mat-icon>
              Add Account
            </button>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="accounts-grid">
          @for (account of accounts(); track account.id) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ account.name }}</mat-card-title>
                @if (account.isActive) {
                  <mat-chip color="primary">Active</mat-chip>
                }
              </mat-card-header>
              <mat-card-content>
                <p><strong>Host:</strong> {{ account.host }}:{{ account.port }}</p>
                <p><strong>Username:</strong> {{ account.username }}</p>
                @if (account.lastSync) {
                  <p><strong>Last Sync:</strong> {{ account.lastSync | date:'short' }}</p>
                }
              </mat-card-content>
              <mat-card-actions>
                @if (!account.isActive) {
                  <button mat-button (click)="activate(account.id)">
                    <mat-icon>check_circle</mat-icon>
                    Activate
                  </button>
                }
                <button mat-button (click)="edit(account.id)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-button color="warn" (click)="delete(account.id)">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .accounts-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    mat-card {
      height: 100%;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    mat-card-content p {
      margin: 8px 0;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class AccountsComponent implements OnInit {
  accounts = signal<Account[]>([]);
  loading = signal(true);

  constructor(
    private accountService: AccountService,
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading.set(true);
    this.accountService.getAccounts().subscribe({
      next: (response) => {
        this.accounts.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addAccount() {
    this.router.navigate(['/accounts/new']);
  }

  edit(id: number) {
    this.router.navigate(['/accounts/edit', id]);
  }

  activate(id: number) {
    this.accountService.activateAccount(id).subscribe({
      next: () => {
        this.loadAccounts();
      }
    });
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(id).subscribe({
        next: () => {
          this.loadAccounts();
        }
      });
    }
  }
  
  importJson() {
    const accountId = prompt('Enter Account ID:');
    const path = prompt('Enter directory path:', 'C:/Users/Shitj/OneDrive/Documenten/IPTeaV-manager/main/downloads/TiviOne_20251116_150100');
    
    if (accountId && path) {
      const dialogRef = this.dialog.open(ImportProgressDialog, {
        width: '400px',
        disableClose: true
      });
      
      this.accountService.importJson(Number(accountId), path).subscribe({
        next: (response) => {
          dialogRef.close();
          alert(response.message);
          this.loadAccounts();
        },
        error: (err) => {
          dialogRef.close();
          alert('Import failed: ' + err.error?.message);
        }
      });
    }
  }
}

@Component({
  selector: 'import-progress-dialog',
  standalone: true,
  imports: [MatProgressBarModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Importing Data</h2>
    <mat-dialog-content>
      <p>{{ status() }}</p>
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </mat-dialog-content>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px;
    }
    p {
      margin-bottom: 16px;
    }
  `]
})
export class ImportProgressDialog {
  status = signal('Loading Live TV...');
  
  constructor() {
    setTimeout(() => this.status.set('Loading Movies...'), 2000);
    setTimeout(() => this.status.set('Loading Series...'), 4000);
    setTimeout(() => this.status.set('Finalizing...'), 6000);
  }
}
