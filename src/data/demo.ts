import type { Account, Dataset, Kind, Snapshot, Transaction } from '../domain/types';
import { isLiability, safe, shift } from '../domain/finance';

export const DEMO_WORKSPACE = 'demo-workspace';
export function createDemo(): Dataset {
  const start = '2025-10-08'; const asOf = '2026-10-09';
  const base = { workspaceId: DEMO_WORKSPACE, currency: 'USD' as const, openingDate: start };
  const accounts: Account[] = [
    { ...base, id: 'checking', name: 'Everyday checking', institution: 'Meridian Bank', type: 'CHECKING', openingBalance: 1850000, mask: '4821' },
    { ...base, id: 'savings', name: 'High-yield savings', institution: 'Evergreen', type: 'SAVINGS', openingBalance: 4200000, mask: '0916' },
    { ...base, id: 'reserve', name: 'Long-term reserve', institution: 'Meridian Bank', type: 'SAVINGS', openingBalance: 3500000, mask: '7302' },
    { ...base, id: 'home', name: 'Primary residence', institution: 'Manual valuation', type: 'MANUAL_ASSET', openingBalance: 42500000, mask: '' },
    { ...base, id: 'mortgage', name: 'Home mortgage', institution: 'Meridian Lending', type: 'MORTGAGE', openingBalance: 28500000, relatedAssetId: 'home', mask: '6640' },
    { ...base, id: 'card', name: 'Everyday rewards', institution: 'Northstar', type: 'CREDIT_CARD', openingBalance: 124000, mask: '2088' },
  ];
  const transactions: Transaction[] = []; const snapshots: Snapshot[] = [];
  const balances = new Map(accounts.map(a => [a.id, a.openingBalance]));
  let sequence = 0;
  function add(date: string, accountId: string, description: string, category: string, amount: number, kind: Kind, direction: 'DEBIT' | 'CREDIT', recurring = false, transferId?: string, status: 'POSTED' | 'PENDING' = 'POSTED') {
    const account = accounts.find(a => a.id === accountId)!;
    transactions.push({ id: `demo-${++sequence}`, workspaceId: DEMO_WORKSPACE, accountId, date, description, category, amount, currency: 'USD', kind, direction, status, source: 'SYNTHETIC', recurring, transferId });
    if (status === 'POSTED') balances.set(accountId, safe(balances.get(accountId)! + amount * (direction === 'CREDIT' ? 1 : -1) * (isLiability(account) ? -1 : 1)));
  }
  for (let date = start; date <= asOf; date = shift(date, 1)) {
    const day = Number(date.slice(-2)); const month = Number(date.slice(5, 7)); const weekday = new Date(date + 'T12:00:00Z').getUTCDay();
    if (date !== start) {
      if (day === 1 || day === 15) add(date, 'checking', 'Forma Studio · Payroll', 'Salary', 425000, 'INCOME', 'CREDIT', true);
      if (day === 6) add(date, 'checking', 'Oak & Co · Design retainer', 'Freelancing', 115000 + month * 1200, 'INCOME', 'CREDIT', true);
      if (day === 8) add(date, 'savings', 'Monthly savings interest', 'Interest', 14200 + month * 240, 'INCOME', 'CREDIT', true);
      if (day === 2) {
        add(date, 'checking', 'Home loan · Principal', 'Loan principal', 97500, 'LOAN_PRINCIPAL', 'DEBIT', true, `loan-${date}`);
        add(date, 'mortgage', 'Home loan · Principal received', 'Loan principal', 97500, 'LOAN_PRINCIPAL', 'CREDIT', true, `loan-${date}`);
        add(date, 'checking', 'Home loan · Interest', 'Housing', 122000, 'EXPENSE', 'DEBIT', true);
        add(date, 'checking', 'Home insurance & property tax', 'Housing', 48000, 'EXPENSE', 'DEBIT', true);
      }
      if (day === 16) {
        add(date, 'checking', 'Transfer to savings', 'Internal transfer', 160000, 'TRANSFER', 'DEBIT', true, `saving-${date}`);
        add(date, 'savings', 'Transfer from checking', 'Internal transfer', 160000, 'TRANSFER', 'CREDIT', true, `saving-${date}`);
      }
      if (day === 20) {
        const payment = Math.max(0, balances.get('card')!);
        if (payment) { add(date, 'checking', 'Northstar card payment', 'Card payment', payment, 'CARD_PAYMENT', 'DEBIT', true, `card-${date}`); add(date, 'card', 'Payment received', 'Card payment', payment, 'CARD_PAYMENT', 'CREDIT', true, `card-${date}`); }
      }
      if (weekday === 6) add(date, 'card', 'Whole Foods Market', 'Groceries', 15430 + month * 320 + day * 20, 'EXPENSE', 'DEBIT');
      if (weekday === 2 || weekday === 5) add(date, 'card', weekday === 2 ? 'Little Fern Café' : 'Juniper Kitchen', 'Dining', 3250 + month * 70 + day * 25, 'EXPENSE', 'DEBIT');
      if (day === 4) add(date, 'checking', 'City utilities', 'Utilities', 18500 + month * 360, 'EXPENSE', 'DEBIT', true);
      if (day === 7) add(date, 'card', 'Fable & Thread', 'Shopping', 19400 + month * 700, 'EXPENSE', 'DEBIT');
      if (day === 9) add(date, 'card', 'Metro transit pass', 'Transportation', 13200, 'EXPENSE', 'DEBIT', true);
      if (day === 12) add(date, 'card', 'Music, cloud & streaming', 'Subscriptions', 5497, 'EXPENSE', 'DEBIT', true);
      if (day === 18) add(date, 'checking', 'Health plan', 'Healthcare', 28500, 'EXPENSE', 'DEBIT', true);
      if (day === 24) add(date, 'card', 'Fable & Thread · Return', 'Shopping', 4200, 'REFUND', 'CREDIT');
      if (month % 3 === 0 && day === 22) add(date, 'card', 'Airway · Weekend trip', 'Travel', 58000, 'EXPENSE', 'DEBIT');
    }
    // Explicit synthetic daily balance observations. Home value is intentionally held fixed.
    for (const account of accounts) snapshots.push({ accountId: account.id, date, balance: balances.get(account.id)!, currency: 'USD', source: 'SYNTHETIC' });
  }
  add(asOf, 'card', 'Sunday Coffee · Authorization', 'Dining', 1850, 'EXPENSE', 'DEBIT', false, undefined, 'PENDING');
  return { accounts, transactions: transactions.sort((a, b) => b.date.localeCompare(a.date) || Number(b.id.split('-')[1]) - Number(a.id.split('-')[1])), snapshots, asOf, start };
}
