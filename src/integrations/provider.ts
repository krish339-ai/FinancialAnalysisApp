import type { Account, Snapshot, Transaction } from '@/domain/types';
export interface FinancialProvider {
  id: string;
  connect(workspaceId: string, returnUrl: string): Promise<{ authorizationUrl: string }>;
  accounts(connectionId: string): Promise<Account[]>;
  balances(connectionId: string): Promise<Snapshot[]>;
  transactions(connectionId: string, cursor?: string): Promise<{ records: Transaction[]; nextCursor?: string }>;
  normalize(record: unknown): Transaction;
  status(connectionId: string): Promise<{ state: 'PENDING' | 'READY' | 'ERROR' | 'DISCONNECTED'; lastSyncedAt?: string; errorCode?: string }>;
  disconnect(connectionId: string): Promise<void>;
  revokeConsent(connectionId: string): Promise<void>;
}
