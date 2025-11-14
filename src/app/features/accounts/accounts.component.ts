import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService, Account, CreateAccountRequest } from '../../core/services/account.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="accounts-container">
      <div class="header">
        <h2>IPTV Accounts</h2>
        <button (click)="toggleForm()" class="add-btn">
          {{ showForm() ? 'Cancel' : 'Add Account' }}
        </button>
      </div>

      @if (showForm()) {
        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="account-form">
          <input formControlName="name" placeholder="Account Name" required>
          <input formControlName="host" placeholder="Host (e.g., example.com)" required>
          <input formControlName="port" type="number" placeholder="Port (optional, e.g., 8080)">
          <input formControlName="username" placeholder="Username" required>
          <input formControlName="password" type="password" placeholder="Password" required>
          
          <div class="form-actions">
            <button type="submit" [disabled]="accountForm.invalid || creating()">
              {{ creating() ? (editingAccount() ? 'Updating...' : 'Creating...') : (editingAccount() ? 'Update Account' : 'Create Account') }}
            </button>
          </div>
        </form>
      }

      <div class="accounts-list">
        @if (accountService.loading()) {
          <div class="loading">Loading accounts...</div>
        }
        
        @for (account of accountService.accounts(); track account.id) {
          <div class="account-card" [class.active]="account.isActive">
            <div class="account-info">
              <h3>{{ account.name }}</h3>
              <p>{{ account.host }}:{{ account.port }}</p>
              <p>User: {{ account.username }}</p>
              @if (account.lastSync) {
                <p class="sync-info">Last sync: {{ account.lastSync | date:'short' }}</p>
              }
            </div>
            
            <div class="account-actions">
              @if (!account.isActive) {
                <button (click)="activateAccount(account.id)" class="activate-btn">
                  Activate
                </button>
              } @else {
                <span class="status active">Active</span>
              }
              

              
              <button (click)="editAccount(account)" class="edit-btn">
                Edit
              </button>
              
              <button (click)="deleteAccount(account.id)" class="delete-btn">
                Delete
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No IPTV accounts configured</p>
            <p>Add your first account to get started</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .accounts-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .add-btn { padding: 10px 20px; background: var(--primary, #1976d2); color: white; border: none; border-radius: 6px; cursor: pointer; }
    .account-form { background: var(--surface, #1e1e1e); padding: 2rem; border-radius: 8px; margin-bottom: 2rem; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .account-form input { padding: 12px; border: 1px solid #333; border-radius: 4px; background: var(--background, #121212); color: white; }
    .form-actions { grid-column: 1 / -1; }
    .form-actions button { padding: 12px 24px; background: var(--primary, #1976d2); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .accounts-list { display: grid; gap: 1rem; }
    .account-card { background: var(--surface, #1e1e1e); padding: 1.5rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid transparent; }
    .account-card.active { border-left-color: var(--primary, #1976d2); }
    .account-info h3 { margin: 0 0 0.5rem 0; color: var(--primary, #1976d2); }
    .account-info p { margin: 0.25rem 0; color: #ccc; font-size: 0.9rem; }
    .account-actions { display: flex; gap: 1rem; align-items: center; }
    .activate-btn { padding: 8px 16px; background: var(--primary, #1976d2); color: white; border: none; border-radius: 4px; cursor: pointer; }

    .edit-btn { padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .delete-btn { padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }

    .status.active { color: #4caf50; font-weight: bold; }
    .empty-state { text-align: center; padding: 3rem; color: #666; }
    .loading { text-align: center; padding: 2rem; color: #666; }
  `]
})
export class AccountsComponent implements OnInit {
  readonly accountService = inject(AccountService);
  private readonly fb = inject(FormBuilder);
  
  readonly showForm = signal(false);
  readonly creating = signal(false);
  readonly editingAccount = signal<Account | null>(null);

  
  readonly accountForm = this.fb.group({
    name: ['', Validators.required],
    host: ['', Validators.required],
    port: [8080, [Validators.min(1), Validators.max(65535)]],
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe();
  }

  onSubmit(): void {
    if (this.accountForm.invalid) return;
    
    this.creating.set(true);
    const formValue = this.accountForm.getRawValue();
    const request: CreateAccountRequest = {
      name: formValue.name!,
      host: formValue.host!,
      port: formValue.port || 8080,
      username: formValue.username!,
      password: formValue.password!
    };
    
    console.log('Sending request:', request);
    
    const operation = this.editingAccount() 
      ? this.accountService.updateAccount(this.editingAccount()!.id, request)
      : this.accountService.createAccount(request);
    
    operation.subscribe({
      next: () => this.resetForm(),
      error: (err) => {
        console.error('Error creating account:', err);
        this.creating.set(false);
      }
    });
  }

  activateAccount(id: number): void {
    this.accountService.activateAccount(id).subscribe({
      next: () => this.accountService.getAccounts().subscribe()
    });
  }



  toggleForm(): void {
    if (this.showForm()) {
      this.resetForm();
    } else {
      this.showForm.set(true);
    }
  }

  editAccount(account: Account): void {
    this.editingAccount.set(account);
    this.accountForm.patchValue({
      name: account.name,
      host: account.host,
      port: account.port,
      username: account.username,
      password: ''
    });
    this.showForm.set(true);
  }

  resetForm(): void {
    this.accountForm.reset({ port: 8080 });
    this.showForm.set(false);
    this.creating.set(false);
    this.editingAccount.set(null);
  }

  deleteAccount(id: number): void {
    if (confirm('Delete this account?')) {
      this.accountService.deleteAccount(id).subscribe();
    }
  }
}