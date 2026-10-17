'use client';
import type { RefObject } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Account, Transaction } from '@/domain/types';
import { money } from '@/domain/finance';
import { Dialog, DialogContent } from './ui/dialog';

export function TransactionDetails({ record, accounts, open, onOpenChange, returnFocus }: {
  record?: Transaction;
  accounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocus?: RefObject<HTMLButtonElement | null>;
}) {
  const credit = record?.direction === 'CREDIT';
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent variant="sheet" title={record?.description ?? 'Transaction details'} description="The source and classification behind this sample record." onCloseAutoFocus={event => {
    if (returnFocus?.current?.isConnected) { event.preventDefault(); returnFocus.current.focus(); }
  }}>
    {record && <>
      <div className={`sheet-amount-block ${credit ? 'is-credit' : ''}`}><span className="sheet-direction">{credit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}{credit ? 'Money in' : 'Money out'}</span><div className="detail-amount">{credit ? '+' : '−'}{money(record.amount, true)}</div><span className={`status ${record.status === 'PENDING' ? 'pending' : ''}`}>{record.status === 'PENDING' ? 'Pending authorization' : 'Posted transaction'} · USD</span></div>
      <dl className="detail-list">{[['Date', record.date], ['Account', accounts.find(a => a.id === record.accountId)?.name ?? 'Unknown'], ['Category', record.category], ['Classification', record.kind.replaceAll('_', ' ')], ['Status', record.status], ['Source', record.source], ['Recurring', record.recurring ? 'Yes' : 'No'], ['Transfer relationship', record.transferId ?? 'None']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="sheet-note"><span>HOW THIS COUNTS</span><p>{record.status === 'PENDING' ? 'Pending authorization: excluded from posted analytics and balances.' : ['TRANSFER', 'CARD_PAYMENT', 'LOAN_PRINCIPAL', 'LOAN_PROCEEDS'].includes(record.kind) ? 'This record moves money or changes principal. It is excluded from income and expenses.' : 'Included in posted analytics according to its explicit classification.'}</p></div>
    </>}
  </DialogContent></Dialog>;
}
