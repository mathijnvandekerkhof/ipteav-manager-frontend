export interface Account {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  isActive: boolean;
  lastSync?: string;
  status?: 'IDLE' | 'SYNCING' | 'COMPLETED' | 'FAILED';
}

export interface AccountRequest {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SyncStatus {
  status: 'IDLE' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  message?: string;
}
