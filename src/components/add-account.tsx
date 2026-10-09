'use client';
import { useState } from 'react';
import { Building2, Check, CreditCard, Home, Plus, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { useDemo, type DemoAccount } from './demo-context';
import { cents, money } from '@/domain/finance';
import { useRouter } from 'next/navigation';
const choices = [
  { type: 'CHECKING', label: 'Checking', icon: Wallet }, { type: 'SAVINGS', label: 'Savings', icon: Building2 },
  { type: 'CREDIT_CARD', label: 'Credit card', icon: CreditCard }, { type: 'MORTGAGE', label: 'Mortgage', icon: Home },
  { type: 'AUTO_LOAN', label: 'Auto loan', icon: Wallet }, { type: 'SOLAR_LOAN', label: 'Solar loan', icon: Home },
  { type: 'PERSONAL_LOAN', label: 'Personal loan', icon: Wallet }, { type: 'OTHER_LOAN', label: 'Other loan', icon: Wallet },
  { type: 'MANUAL_ASSET', label: 'Valued asset', icon: Home },
] as const;
export function AddAccount({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false); const [step, setStep] = useState(1);
  const [type, setType] = useState<DemoAccount['type']>('CHECKING'); const [name, setName] = useState('Demo savings');
  const [balance, setBalance] = useState('2500.00'); const [error, setError] = useState('');
  const demo = useDemo(); const router = useRouter();
  function submit() {
    try { const amount = cents(balance); if (amount < 0 || amount > 100000000000 || !name.trim()) throw new Error('Enter a name and a balance between $0 and $1 billion.'); demo.add({ id: crypto.randomUUID(), name: name.trim(), type, balance: amount }); setStep(3); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Check your entries.'); }
  }
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setStep(1); setError(''); } }}><DialogTrigger asChild><Button variant={compact ? 'outline' : 'default'} className={compact ? 'sidebar-add' : ''}><Plus size={17} /> Add account</Button></DialogTrigger><DialogContent title={step === 3 ? 'Demo account created' : 'Make room for the bigger picture'} description={step === 3 ? 'Your account is available in this browser tab for this demo session.' : 'Try adding a synthetic account. Please do not enter real financial information.'}>
    {step < 3 && <div className="stepper"><span className="active">1 · Account type</span><span className={step === 2 ? 'active' : ''}>2 · Details</span></div>}
    {step === 1 && <><div className="account-choices">{choices.map(c => <button key={c.type} className={type === c.type ? 'account-choice selected' : 'account-choice'} onClick={() => setType(c.type)}><c.icon size={21} /><span>{c.label}</span>{type === c.type && <Check size={16} />}</button>)}</div><p className="small muted">Debit cards are payment instruments linked to checking, not separate assets.</p><Button className="full" onClick={() => setStep(2)}>Continue</Button></>}
    {step === 2 && <form onSubmit={e => { e.preventDefault(); submit(); }}><label className="field">Account name<input autoFocus required maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label><label className="field">{['CREDIT_CARD', 'MORTGAGE', 'AUTO_LOAN', 'SOLAR_LOAN', 'PERSONAL_LOAN', 'OTHER_LOAN'].includes(type) ? 'Amount owed' : 'Current value'} · USD<input required inputMode="decimal" value={balance} onChange={e => setBalance(e.target.value)} /></label><div className="notice">This session-only account previews the creation flow. Reference dashboard analytics stay tied to the reconciled sample dataset. Persistent accounts and loan terms follow in the account-management milestone.</div>{error && <p role="alert" className="negative">{error}</p>}<div className="dialog-actions"><Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button><Button type="submit">Create demo account</Button></div></form>}
    {step === 3 && <div className="success-state"><span className="success-icon"><Check size={30} /></span><h3>{name}</h3><p>{money(cents(balance), true)}</p><Button onClick={() => { setOpen(false); router.push('/accounts'); }}>View accounts</Button></div>}
  </DialogContent></Dialog>;
}
