'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { ranges, type Range } from '@/domain/types';
import { useTransition } from 'react';
export function PeriodControls({ value, compact = false }: { value: Range; compact?: boolean }) {
  const router = useRouter(); const path = usePathname(); const params = useSearchParams(); const [pending, startTransition] = useTransition();
  function change(range: string) { const next = new URLSearchParams(params); next.set('range', range); startTransition(() => router.push(`${path}?${next}`, { scroll: false })); }
  if (compact) return <div className="period-tabs" aria-label="Net worth chart period" aria-busy={pending}>{ranges.map(r => <button key={r} onClick={() => change(r)} aria-pressed={r === value} className={r === value ? 'active' : ''}>{r}</button>)}</div>;
  return <label className="period-select"><CalendarDays size={16} /><span className="sr-only">Reporting period</span><select value={value} onChange={e => change(e.target.value)} aria-label="Reporting period" disabled={pending}>{ranges.map(r => <option key={r} value={r}>{r === '1M' ? 'Last 30 days' : r === 'All Time' ? 'All time' : `Last ${r === '1Y' ? '365' : r === '3M' ? '90' : r === '6M' ? '180' : '270'} days`}</option>)}</select><ChevronDown size={14} /></label>;
}
