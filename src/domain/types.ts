export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'MORTGAGE' | 'AUTO_LOAN' | 'SOLAR_LOAN' | 'PERSONAL_LOAN' | 'OTHER_LOAN' | 'MANUAL_ASSET';
export type Kind = 'INCOME' | 'EXPENSE' | 'REFUND' | 'TRANSFER' | 'CARD_PAYMENT' | 'LOAN_PRINCIPAL' | 'LOAN_PROCEEDS';
export type Transaction = {
  id: string; workspaceId: string; accountId: string; date: string; description: string;
  category: string; amount: number; currency: 'USD'; direction: 'DEBIT' | 'CREDIT';
  kind: Kind; status: 'POSTED' | 'PENDING'; source: 'SYNTHETIC' | 'MANUAL' | 'CSV';
  recurring: boolean; transferId?: string; fingerprint?: string;
};
export type Account = {
  id: string; workspaceId: string; name: string; institution: string; type: AccountType;
  currency: 'USD'; openingBalance: number; openingDate: string; mask: string;
  archivedAt?: string; relatedAssetId?: string;
};
export type Snapshot = { accountId: string; date: string; balance: number; currency: 'USD'; source: 'SYNTHETIC' | 'MANUAL' | 'PROVIDER' };
export type Dataset = { accounts: Account[]; transactions: Transaction[]; snapshots: Snapshot[]; asOf: string; start: string };
export const ranges = ['1M', '3M', '6M', '9M', '1Y', 'All Time'] as const;
export type Range = typeof ranges[number];
