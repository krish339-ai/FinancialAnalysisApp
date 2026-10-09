import Papa from 'papaparse';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { cents, validDate } from '@/domain/finance';
import type { Transaction } from '@/domain/types';
const kinds = z.enum(['INCOME', 'EXPENSE', 'REFUND', 'TRANSFER', 'CARD_PAYMENT', 'LOAN_PRINCIPAL', 'LOAN_PROCEEDS']);
export type Mapping = { date: string; description: string; amount?: string; debit?: string; credit?: string; direction?: string; kind: string; currency?: string; category?: string };
export const defaultMapping: Mapping = { date: 'date', description: 'description', amount: 'amount', direction: 'direction', kind: 'kind', currency: 'currency', category: 'category' };
export function fingerprint(t: Pick<Transaction, 'workspaceId' | 'accountId' | 'date' | 'description' | 'amount' | 'direction' | 'currency'>) { return createHash('sha256').update(JSON.stringify([t.workspaceId, t.accountId, t.date, t.description.trim().toLowerCase().replace(/\s+/g, ' '), t.amount, t.direction, t.currency])).digest('hex'); }
export function parseCSV(text: string, accountId: string, workspaceId: string, mapping = defaultMapping, existing = new Set<string>()) {
  if (Buffer.byteLength(text, 'utf8') > 2 * 1024 * 1024) throw new Error('CSV must be 2 MB or smaller.');
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: header => header.trim().replace(/^\uFEFF/, '') });
  if (parsed.errors.length) throw new Error('Malformed CSV. Check headers, quotation marks and column counts.');
  if (parsed.data.length > 10000) throw new Error('CSV must have no more than 10,000 rows.');
  const required = [mapping.date, mapping.description, mapping.kind, ...(mapping.amount ? [mapping.amount] : [mapping.debit!, mapping.credit!])];
  if (required.some(field => !field || !parsed.meta.fields?.includes(field))) throw new Error('Missing mapped columns.');
  const seen = new Set(existing);
  return parsed.data.map((row, index) => {
    try {
      const date = row[mapping.date]?.trim(); if (!validDate(date)) throw new Error('Use a valid ISO date (YYYY-MM-DD).');
      const description = row[mapping.description]?.trim(); if (!description || description.length > 200) throw new Error('Description must contain 1–200 characters.');
      const currency = mapping.currency ? row[mapping.currency]?.trim().toUpperCase() : 'USD'; if (currency !== 'USD') throw new Error('Only USD is supported.');
      const kind = kinds.parse(row[mapping.kind]?.trim().toUpperCase());
      let amount: number; let direction: Transaction['direction'];
      if (mapping.amount) {
        const signed = cents(row[mapping.amount]?.trim() ?? ''); amount = Math.abs(signed);
        const explicit = mapping.direction ? row[mapping.direction]?.trim().toUpperCase() : undefined;
        if (explicit && explicit !== 'DEBIT' && explicit !== 'CREDIT') throw new Error('Direction must be DEBIT or CREDIT.');
        if (signed < 0 && explicit === 'CREDIT') throw new Error('Negative amount conflicts with CREDIT direction.');
        direction = explicit as Transaction['direction'] || (signed < 0 ? 'DEBIT' : 'CREDIT');
      } else {
        const debit = cents(row[mapping.debit!]?.trim() || '0'); const credit = cents(row[mapping.credit!]?.trim() || '0');
        if (debit < 0 || credit < 0 || (debit > 0 && credit > 0)) throw new Error('Supply exactly one positive debit or credit.');
        amount = debit || credit; direction = debit > 0 ? 'DEBIT' : 'CREDIT';
      }
      if (amount <= 0) throw new Error('Amount must be greater than zero.');
      if (['INCOME', 'REFUND', 'LOAN_PROCEEDS'].includes(kind) && direction !== 'CREDIT') throw new Error('This classification requires a credit.');
      if (kind === 'EXPENSE' && direction !== 'DEBIT') throw new Error('An expense requires a debit.');
      const transaction: Transaction = { id: `csv-${index + 1}`, workspaceId, accountId, date, description, currency: 'USD', amount, direction, kind, category: mapping.category ? row[mapping.category]?.trim() || 'Uncategorized' : 'Uncategorized', status: 'POSTED', source: 'CSV', recurring: false };
      const hash = fingerprint(transaction); const duplicate = seen.has(hash); seen.add(hash); transaction.fingerprint = hash;
      return { row: index + 2, transaction, duplicate, error: null };
    } catch (e) { return { row: index + 2, transaction: null, duplicate: false, error: e instanceof z.ZodError ? 'Choose an explicit valid transaction classification.' : e instanceof Error ? e.message : 'Invalid row.' }; }
  });
}
