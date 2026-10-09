import { describe, expect, it } from 'vitest';
import { cents, comparison, flows, inPeriod, isLiability, overview, position, shift, sum, validDate, windowFor } from '../../src/domain/finance';
import { createDemo } from '../../src/data/demo';
import { requireOwnership } from '../../src/server/authorization';
import { editTransaction } from '../../src/domain/transaction-edit';
import type { Transaction } from '../../src/domain/types';
const demo = createDemo();
const base: Transaction = { id: 't', workspaceId: 'w', accountId: 'a', date: '2026-10-09', description: 'Test', category: 'Test', amount: 10000, currency: 'USD', direction: 'CREDIT', kind: 'INCOME', status: 'POSTED', source: 'SYNTHETIC', recurring: false };
const flow = (items: Partial<Transaction>[]) => flows(items.map(t => ({ ...base, ...t })), '2026-10-01', '2026-10-09');
describe('Money and reporting dates', () => {
  it('parses cents without floating point accumulation', () => { expect(cents('0.29')).toBe(29); expect(sum([cents('0.1'), cents('0.2')])).toBe(30); expect(cents('-83.42')).toBe(-8342); });
  it('rejects precision loss and unsafe arithmetic', () => { expect(() => cents('1.001')).toThrow(); expect(() => cents('1e3')).toThrow(); expect(() => sum([Number.MAX_SAFE_INTEGER, 1])).toThrow(); });
  it('defines 30 inclusive reporting dates and the preceding equal period', () => { expect(windowFor('1M', '2026-10-09', demo.start)).toEqual({ start: '2026-09-10', end: '2026-10-09', previousStart: '2026-08-11', previousEnd: '2026-09-09' }); });
  it('does not shift date boundaries across daylight savings', () => { expect(shift('2026-03-08', -1)).toBe('2026-03-07'); expect(shift('2026-11-01', 1)).toBe('2026-11-02'); });
  it('includes exact boundaries and excludes adjacent dates', () => { expect(inPeriod({ date: '2026-09-10' }, '2026-09-10', '2026-10-09')).toBe(true); expect(inPeriod({ date: '2026-10-10' }, '2026-09-10', '2026-10-09')).toBe(false); });
  it('rejects impossible dates', () => { expect(validDate('2026-02-30')).toBe(false); expect(validDate('2024-02-29')).toBe(true); });
  it('omits invalid and missing percentage baselines', () => { expect(comparison(100, 0).percentage).toBeNull(); expect(comparison(100, -100).percentage).toBeNull(); expect(comparison(100, null).movement).toBeNull(); expect(comparison(120, 100).percentage).toBe(20); });
});
describe('Explicit classification', () => {
  it('counts salary, but not all credits, as income', () => { expect(flow([{ kind: 'INCOME' }, { kind: 'TRANSFER' }, { kind: 'LOAN_PROCEEDS' }]).income).toBe(10000); });
  it('counts purchases once, excluding repayment legs', () => { expect(flow([{ kind: 'EXPENSE', direction: 'DEBIT' }, { kind: 'CARD_PAYMENT', direction: 'DEBIT' }, { kind: 'CARD_PAYMENT', direction: 'CREDIT' }]).expenses).toBe(10000); });
  it('excludes both internal transfer legs', () => { expect(flow([{ kind: 'TRANSFER', direction: 'DEBIT' }, { kind: 'TRANSFER', direction: 'CREDIT' }])).toEqual({ income: 0, expenses: 0 }); });
  it('separates principal from interest', () => { expect(flow([{ kind: 'LOAN_PRINCIPAL', amount: 97500 }, { kind: 'LOAN_PRINCIPAL', amount: 97500 }, { kind: 'EXPENSE', category: 'Interest', amount: 122000, direction: 'DEBIT' }]).expenses).toBe(122000); });
  it('reduces expenses by refunds', () => { expect(flow([{ kind: 'EXPENSE', amount: 10000 }, { kind: 'REFUND', amount: 4000 }])).toEqual({ income: 0, expenses: 6000 }); });
  it('excludes pending income and expenses', () => { expect(flow([{ kind: 'INCOME', status: 'PENDING' }, { kind: 'EXPENSE', status: 'PENDING' }])).toEqual({ income: 0, expenses: 0 }); });
  it('returns empty activity as zero, without fabricating history', () => { expect(flows([], demo.start, demo.asOf)).toEqual({ income: 0, expenses: 0 }); const s = overview(demo, 'All Time'); expect(s.previous).toBeNull(); expect(s.netChange.percentage).toBeNull(); });
});
describe('Point in time balances and reconciliation', () => {
  it('calculates opening assets minus liabilities', () => { const p = position(demo.accounts, demo.snapshots, demo.start); expect(p.netWorth).toBe(1850000 + 4200000 + 3500000 + 42500000 - 28500000 - 124000); });
  it('returns unavailable when a required balance is missing', () => { const snapshots = demo.snapshots.filter(s => s.accountId !== 'card'); expect(position(demo.accounts, snapshots, demo.asOf).netWorth).toBeNull(); });
  it('does not take future snapshots', () => { expect(position(demo.accounts, demo.snapshots.filter(s => s.date === demo.asOf), demo.start).complete).toBe(false); });
  it('flags missing corresponding property valuations', () => { expect(position(demo.accounts.filter(a => a.id !== 'home'), demo.snapshots, demo.asOf).missingValuation).toBe(true); });
  it('preserves historical archived-account contribution', () => { const accounts = demo.accounts.map(a => a.id === 'checking' ? { ...a, archivedAt: '2026-10-01' } : a); expect(position(accounts, demo.snapshots, '2026-09-30').balances).toHaveLength(6); expect(position(accounts, demo.snapshots, '2026-10-01').balances).toHaveLength(5); });
  it('reconciles every daily account snapshot to posted ledger activity', () => {
    for (const account of demo.accounts) {
      let balance = account.openingBalance;
      const observations = demo.snapshots.filter(s => s.accountId === account.id);
      for (const snapshot of observations) {
        for (const t of demo.transactions.filter(t => t.accountId === account.id && t.date === snapshot.date && t.status === 'POSTED')) balance += t.amount * (t.direction === 'CREDIT' ? 1 : -1) * (isLiability(account) ? -1 : 1);
        expect(snapshot.balance, `${account.id} ${snapshot.date}`).toBe(balance);
      }
    }
  });
  it('reconciles total net worth movement with income less expenses under constant valuations', () => { const opening = position(demo.accounts, demo.snapshots, demo.start).netWorth!; const closing = position(demo.accounts, demo.snapshots, demo.asOf).netWorth!; const totals = flows(demo.transactions, demo.start, demo.asOf); expect(closing - opening).toBe(totals.income - totals.expenses); });
  it('pairs every transfer and repayment within its workspace', () => { for (const id of new Set(demo.transactions.map(t => t.transferId).filter(Boolean))) { const pair = demo.transactions.filter(t => t.transferId === id); expect(pair).toHaveLength(2); expect(pair[0].amount).toBe(pair[1].amount); expect(pair[0].direction).not.toBe(pair[1].direction); expect(pair[0].workspaceId).toBe(pair[1].workspaceId); } });
});
describe('Ownership and edits', () => {
  it('denies anonymous and cross-workspace operations', () => { expect(() => requireOwnership(null, 'w')).toThrow('Access denied'); expect(() => requireOwnership({ userId: 'u', workspaceIds: ['other'] }, 'w')).toThrow('Access denied'); });
  it('allows authorized metadata edits and preserves financial fields', () => { const edited = editTransaction(base, { category: 'Salary', description: ' Payroll ' }, { userId: 'u', workspaceIds: ['w'] }); expect(edited.category).toBe('Salary'); expect(edited.description).toBe('Payroll'); expect(edited.amount).toBe(base.amount); expect(base.category).toBe('Test'); });
  it('rejects financial and owner fields smuggled through metadata edits', () => { expect(() => editTransaction(base, { amount: 0 }, { userId: 'u', workspaceIds: ['w'] })).toThrow(); expect(() => editTransaction(base, { category: 'Bad' }, { userId: 'u', workspaceIds: ['other'] })).toThrow(); });
});
