import type { Account, Dataset, Range, Snapshot, Transaction } from './types';

export const REPORTING_TIMEZONE = 'America/New_York';
export function cents(input: string): number {
  if (!/^-?\d+(\.\d{1,2})?$/.test(input.trim())) throw new Error('Use an amount with at most two decimal places.');
  const negative = input.trim().startsWith('-');
  const [whole, fraction = ''] = input.trim().replace('-', '').split('.');
  const amount = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return safe(Number(negative ? -amount : amount));
}
export function safe(value: number): number { if (!Number.isSafeInteger(value)) throw new Error('Amount exceeds safe integer range.'); return value; }
export function sum(values: number[]) { return values.reduce((a, b) => safe(a + safe(b)), 0); }
export function money(value: number, decimals = false) {
  safe(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 }).format(value / 100);
}
export function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value; }
export function shift(date: string, days: number) { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
export function windowFor(range: Range, end: string, first: string) {
  const days = { '1M': 30, '3M': 90, '6M': 180, '9M': 270, '1Y': 365 };
  const start = range === 'All Time' ? first : shift(end, -(days[range] - 1));
  const count = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  return { start, end, previousStart: shift(start, -count), previousEnd: shift(start, -1) };
}
export function inPeriod(t: { date: string }, start: string, end: string) { return t.date >= start && t.date <= end; }
export function isLiability(a: Account) { return !['CHECKING', 'SAVINGS', 'MANUAL_ASSET'].includes(a.type); }
export function flows(records: Transaction[], start: string, end: string) {
  const posted = records.filter(t => t.status === 'POSTED' && inPeriod(t, start, end));
  if (posted.some(t => t.currency !== 'USD')) throw new Error('Mixed currencies require conversion.');
  return {
    income: sum(posted.filter(t => t.kind === 'INCOME').map(t => t.amount)),
    expenses: sum(posted.filter(t => t.kind === 'EXPENSE' || t.kind === 'REFUND').map(t => t.kind === 'REFUND' ? -t.amount : t.amount)),
  };
}
export function comparison(current: number, previous: number | null) {
  return { movement: previous === null ? null : safe(current - previous), percentage: previous === null || previous <= 0 ? null : (current - previous) / previous * 100 };
}
export function position(accounts: Account[], snapshots: Snapshot[], date: string) {
  const eligible = accounts.filter(a => a.openingDate <= date && (!a.archivedAt || a.archivedAt > date));
  const balances = eligible.map(account => ({ account, snapshot: snapshots.filter(s => s.accountId === account.id && s.date <= date).sort((a, b) => b.date.localeCompare(a.date))[0] }));
  if (balances.some(b => b.account.currency !== 'USD' || (b.snapshot && b.snapshot.currency !== 'USD'))) throw new Error('Mixed currencies require conversion.');
  const complete = eligible.length > 0 && balances.every(b => b.snapshot);
  const assets = sum(balances.filter(b => !isLiability(b.account)).map(b => b.snapshot?.balance ?? 0));
  const liabilities = sum(balances.filter(b => isLiability(b.account)).map(b => b.snapshot?.balance ?? 0));
  const missingValuation = eligible.some(a => ['MORTGAGE', 'AUTO_LOAN'].includes(a.type) && !eligible.some(asset => asset.id === a.relatedAssetId));
  return { assets, liabilities, netWorth: complete ? safe(assets - liabilities) : null, complete, missingValuation, balances,
    freshness: balances.filter(b => b.snapshot).map(b => b.snapshot.date).sort()[0] ?? null };
}
export function breakdown(records: Transaction[], kind: 'income' | 'expenses') {
  const totals = new Map<string, number>();
  for (const t of records) {
    if (t.status !== 'POSTED' || (kind === 'income' ? t.kind !== 'INCOME' : !['EXPENSE', 'REFUND'].includes(t.kind))) continue;
    totals.set(t.category, safe((totals.get(t.category) ?? 0) + (t.kind === 'REFUND' ? -t.amount : t.amount)));
  }
  return [...totals].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
export function overview(data: Dataset, range: Range) {
  const period = windowFor(range, data.asOf, data.start);
  const records = data.transactions.filter(t => inPeriod(t, period.start, period.end));
  const current = position(data.accounts, data.snapshots, data.asOf);
  const previousPosition = position(data.accounts, data.snapshots, period.previousEnd);
  const totals = flows(records, period.start, period.end);
  const previous = period.previousStart >= data.start ? flows(data.transactions, period.previousStart, period.previousEnd) : null;
  const dates = [...new Set(data.snapshots.filter(s => inPeriod(s, period.start, period.end)).map(s => s.date))].sort();
  return { period, records, current, totals, previous,
    netChange: current.netWorth === null ? { movement: null, percentage: null } : comparison(current.netWorth, previousPosition.netWorth),
    incomeChange: comparison(totals.income, previous?.income ?? null), expenseChange: comparison(totals.expenses, previous?.expenses ?? null),
    incomeSources: breakdown(records, 'income'), expenseCategories: breakdown(records, 'expenses'),
    history: dates.map(date => { const p = position(data.accounts, data.snapshots, date); return { date, netWorth: p.netWorth, assets: p.assets, liabilities: p.liabilities }; }),
  };
}
export type Overview = ReturnType<typeof overview>;
