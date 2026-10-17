'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, ChevronRight, CircleHelp, FlaskConical, LayoutGrid, Menu, Settings2, ShieldCheck, Wallet } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AddAccount } from './add-account';
import { CommandMenu } from './command-menu';
import { DemoProvider } from './demo-context';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

const links = [
  { href: '/dashboard', title: 'Overview', icon: LayoutGrid }, { href: '/accounts', title: 'Accounts', icon: Wallet }, { href: '/transactions', title: 'Transactions', icon: Activity },
  { href: '/net-worth', title: 'Net worth', icon: ChartNoAxesCombined }, { href: '/income', title: 'Income', icon: ArrowDownLeft }, { href: '/expenses', title: 'Expenses', icon: ArrowUpRight },
];

function Navigation({ pathname, onNavigate, mobile = false }: { pathname: string; onNavigate?: () => void; mobile?: boolean }) {
  return <>
    <Link className="brand" href="/" aria-label="Aureli home" onClick={onNavigate}><span className="brand-mark"><ChartNoAxesCombined size={23} strokeWidth={2} /></span>aureli<span className="brand-period">.</span></Link>
    <div className="workspace-label">PERSONAL WORKSPACE</div>
    <nav aria-label="Main navigation">{links.map((link, i) => <div key={link.href}>{i === 3 && <div className="nav-divider">YOUR PERSPECTIVE</div>}<Link onClick={onNavigate} href={link.href} className={pathname === link.href ? 'nav-link selected' : 'nav-link'} aria-current={pathname === link.href ? 'page' : undefined}><link.icon size={19} />{link.title}{pathname === link.href && <span className="nav-active-dot" />}</Link></div>)}</nav>
    {!mobile && <AddAccount compact />}
    <div className="sidebar-bottom"><div className="demo-panel"><FlaskConical size={18} /><strong>A little room to explore.</strong><p>A synthetic workspace for a clearer perspective.</p><Link href="/settings" onClick={onNavigate}>Explore the demo <ChevronRight size={14} /></Link></div><Link href="/settings" className={pathname === '/settings' ? 'nav-link selected' : 'nav-link'} onClick={onNavigate}><Settings2 size={18} />Settings</Link><Link href="/settings#methodology" className="nav-link" onClick={onNavigate}><CircleHelp size={18} />How the numbers work</Link><Link href="/settings" className="profile" onClick={onNavigate}><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Personal workspace · Demo</small></span><ChevronRight size={16} /></Link></div>
  </>;
}

function MobileDock({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <nav className="mobile-dock" aria-label="Quick navigation">
      {links.slice(0, 3).map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
        <link.icon size={19} strokeWidth={1.6} /><span>{link.title === 'Transactions' ? 'Activity' : link.title}</span>
      </Link>)}
      <DialogTrigger asChild><button className={!links.slice(0, 3).some(link => link.href === pathname) ? 'dock-more-active' : ''} aria-label="More workspace pages"><Menu size={20} /><span>More</span></button></DialogTrigger>
    </nav>
    <DialogContent variant="navigation" title="Main navigation" description="Navigate your Aureli workspace."><Navigation pathname={pathname} mobile onNavigate={() => setOpen(false)} /></DialogContent>
  </Dialog>;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const title = links.find(link => link.href === pathname)?.title ?? 'Settings';
  if (pathname === '/') return <>{children}</>;
  return <DemoProvider><div className="app-shell">
    <aside className="sidebar"><Navigation pathname={pathname} /></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb">
      <Dialog open={menu} onOpenChange={setMenu}><DialogTrigger asChild><button className="mobile-menu icon-button" aria-label="Open navigation"><Menu size={21} /></button></DialogTrigger><DialogContent variant="navigation" title="Main navigation" description="Navigate your Aureli workspace."><Navigation pathname={pathname} mobile onNavigate={() => setMenu(false)} /></DialogContent></Dialog>
      <span className="breadcrumb-workspace">Workspace</span><ChevronRight className="breadcrumb-chevron" size={13} /><strong>{title}</strong>
    </div><div className="topbar-right"><CommandMenu /><Link href="/settings" className="demo-badge"><span /> Demo</Link><Link href="/settings" className="avatar small-avatar" aria-label="Profile and settings">JD</Link></div></header>
      <main id="main-content"><div className="workspace-page" key={pathname}>{children}</div></main>
      <footer className="footer"><span><ShieldCheck size={13} /> Synthetic data. Real perspective.</span><span>USD · America/New_York</span></footer>
      <MobileDock pathname={pathname} />
    </div>
  </div></DemoProvider>;
}
