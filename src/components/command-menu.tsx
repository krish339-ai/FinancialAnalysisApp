'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, CornerDownLeft, LayoutGrid, Search, Settings2, Wallet, Activity, CircleHelp } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

const commands = [
  { label: 'Overview', description: 'Your complete financial picture', href: '/dashboard', icon: LayoutGrid, keywords: 'home dashboard' },
  { label: 'Accounts', description: 'Balances, institutions, and account details', href: '/accounts', icon: Wallet, keywords: 'bank savings checking credit mortgage' },
  { label: 'Transactions', description: 'Search, filter, and export your activity', href: '/transactions', icon: Activity, keywords: 'search activity ledger csv export' },
  { label: 'Net worth', description: 'Assets, liabilities, and historical balances', href: '/net-worth', icon: ChartNoAxesCombined, keywords: 'wealth assets debt balance' },
  { label: 'Income', description: 'Understand where your money comes from', href: '/income', icon: ArrowDownLeft, keywords: 'earnings salary payroll' },
  { label: 'Expenses', description: 'Explore your spending by category', href: '/expenses', icon: ArrowUpRight, keywords: 'spending purchases groceries' },
  { label: 'Settings', description: 'Manage your demo workspace', href: '/settings', icon: Settings2, keywords: 'preferences reset' },
  { label: 'How the numbers work', description: 'Financial rules and calculation methodology', href: '/settings#methodology', icon: CircleHelp, keywords: 'help calculations support' },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const id = useId();
  const results = commands.filter(command => query.trim().toLowerCase().split(/\s+/).every(term => `${command.label} ${command.description} ${command.keywords}`.toLowerCase().includes(term)));
  const current = Math.min(active, Math.max(0, results.length - 1));

  function changeOpen(value: boolean) {
    setOpen(value);
    if (value) { setQuery(''); setActive(0); }
  }
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.repeat) {
        if (!open && document.querySelector('[role="dialog"]')) return;
        event.preventDefault();
        setOpen(value => !value); setQuery(''); setActive(0);
      }
    }
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [open]);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, query]);
  function navigate(href: string) { setOpen(false); router.push(href); }

  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><button className="command-trigger" aria-label="Open command menu"><Search size={17} /><span>Jump to anything…</span><kbd>⌘ / Ctrl K</kbd></button></DialogTrigger>
    <DialogContent variant="command" title="Go anywhere in Aureli" description="Search destinations. Use the arrow keys to choose, Enter to open, and Escape to close." onOpenAutoFocus={event => { event.preventDefault(); input.current?.focus(); }}>
      <div className="command-search"><Search size={21} /><input ref={input} role="combobox" aria-label="Search destinations" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-results`} aria-activedescendant={results.length ? `${id}-option-${current}` : undefined} placeholder="Where would you like to go?" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (results.length) setActive((current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
        } else if (event.key === 'Enter' && results[current]) { event.preventDefault(); navigate(results[current].href); }
      }} /></div>
      <div className="command-section-label">YOUR WORKSPACE <span aria-live="polite">{results.length} destinations</span></div>
      <div className="command-results" id={`${id}-results`} role="listbox" aria-label="Destinations" ref={list}>
        {results.map((command, index) => <button key={command.href} id={`${id}-option-${index}`} role="option" tabIndex={-1} aria-selected={current === index} className="command-result" onPointerMove={() => setActive(index)} onClick={() => navigate(command.href)}><span className="command-result-icon"><command.icon size={19} /></span><span><strong>{command.label}</strong><small>{command.description}</small></span><CornerDownLeft className="command-enter" size={16} /></button>)}
      </div>
      {!results.length && <div className="command-empty"><Search size={26} /><strong>No destinations found</strong><p>Try “accounts”, “spending”, or “export”.</p></div>}
      <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate <kbd>↵</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>
    </DialogContent>
  </Dialog>;
}
