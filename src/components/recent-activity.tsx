'use client';
import { useRef, useState } from 'react';
import { ArrowDownLeft, CreditCard, ShoppingBag } from 'lucide-react';
import type { Account, Transaction } from '@/domain/types';
import { money } from '@/domain/finance';
import { TransactionDetails } from './transaction-details';

export function RecentActivity({ records, accounts }: { records: Transaction[]; accounts: Account[] }) {
  const [record, setRecord] = useState<Transaction>();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <><div className="recent-list">{records.map(t => <button className="recent-row" key={t.id} onClick={event => { trigger.current = event.currentTarget; setRecord(t); setOpen(true); }} aria-haspopup="dialog">
    <span className={`transaction-icon ${t.direction === 'CREDIT' ? 'credit' : ''}`}>{t.direction === 'CREDIT' ? <ArrowDownLeft size={18} /> : t.kind === 'CARD_PAYMENT' ? <CreditCard size={18} /> : <ShoppingBag size={18} />}</span>
    <span className="recent-description"><strong>{t.description}</strong><small>{accounts.find(a => a.id === t.accountId)?.name} · {t.status === 'PENDING' ? 'Pending' : t.category}</small></span>
    <span className="recent-amount"><strong className={t.direction === 'CREDIT' ? 'positive' : ''}>{t.direction === 'CREDIT' ? '+' : '−'}{money(t.amount, true)}</strong><small>{new Date(t.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</small></span>
  </button>)}</div><TransactionDetails record={record} accounts={accounts} open={open} onOpenChange={setOpen} returnFocus={trigger} /></>;
}
