import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, Command, MoveUpRight } from 'lucide-react';
import { LandingPerspectives } from './landing-perspectives';
import { AppearanceToggle } from './appearance-context';
import { money, type Overview } from '@/domain/finance';

export type LandingData = {
  netWorth: number | null; assets: number; liabilities: number; income: number; expenses: number;
  asOf: string; history: Overview['history'];
  period: { start: string; end: string }; incomeSources: Overview['incomeSources'];
};

function HistoryGraphic({ history }: { history: LandingData['history'] }) {
  const values = history.filter(point => point.netWorth !== null);
  if (!values.length) return null;
  const min = Math.min(...values.map(point => point.netWorth!));
  const max = Math.max(...values.map(point => point.netWorth!));
  const points = values.map((point, index) => ({ x: 12 + index / Math.max(1, values.length - 1) * 476, y: 140 - (point.netWorth! - min) / Math.max(1, max - min) * 110 }));
  const path = points.map((point, index) => index ? `H${point.x}V${point.y}` : `M${point.x},${point.y}`).join(' ');
  return <svg viewBox="0 0 500 170" role="img" aria-label={`Recorded net worth from ${values[0].date} to ${values.at(-1)!.date}`}>
    <defs><linearGradient id="landing-history-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--chart-1)" stopOpacity=".17" /><stop offset="1" stopColor="var(--chart-1)" stopOpacity="0" /></linearGradient></defs>
    {[40, 90, 140].map(y => <path key={y} d={`M0 ${y}H500`} stroke="var(--chart-grid)" />)}
    <path d={`${path}V170H12Z`} fill="url(#landing-history-fill)" /><path d={path} fill="none" stroke="var(--chart-1)" strokeWidth="1.8" />
    <circle cx={points.at(-1)!.x} cy={points.at(-1)!.y} r="3.5" fill="var(--chart-1)" />
  </svg>;
}

export function LandingPage({ data }: { data: LandingData }) {
  return <div className="aureli-landing">
    <header className="landing-header">
      <Link className="landing-brand" href="/" aria-label="Aureli home"><ChartNoAxesCombined size={25} strokeWidth={1.5} />aureli<span aria-hidden="true">.</span></Link>
      <nav aria-label="Landing navigation"><a href="#perspectives">The perspective</a><a href="#inside">Inside Aureli</a></nav>
      <div className="landing-header-actions"><AppearanceToggle /><Link className="landing-nav-cta" href="/dashboard">Enter workspace <ArrowUpRight size={17} /></Link></div>
    </header>

    <main id="main-content" className="landing-main">
      <LandingPerspectives data={data} />

      <section className="landing-inside" id="inside" aria-labelledby="inside-title">
        <div className="section-intro"><div className="landing-eyebrow">01 / THE ART OF SEEING CLEARLY</div><h2 id="inside-title">More connected.<br /><em>Less complicated.</em></h2><p>Your accounts tell one story. Your activity tells another. Aureli brings them into the same frame.</p></div>
        <div className="inside-composition">
          <div className="landing-product-preview">
            <div className="preview-topline"><span><span className="landing-status-dot" /> YOUR FINANCIAL PICTURE</span><span>01 — 06</span></div>
            <div className="preview-title"><span>Net worth</span><ArrowUpRight size={19} /></div><strong className="preview-value">{data.netWorth === null ? 'Unavailable' : money(data.netWorth)}</strong>
            <HistoryGraphic history={data.history} />
            <div className="preview-dates"><span>{data.history[0]?.date}</span><span>{data.asOf}</span></div>
            <div className="preview-bottom"><span><i /> Assets<strong>{money(data.assets)}</strong></span><span><i /> Liabilities<strong>{money(data.liabilities)}</strong></span></div>
            <div className="preview-float"><ArrowDownLeft size={19} /><div><small>Income this period</small><strong>+{money(data.income)}</strong></div><span>30D</span></div>
            <p className="preview-footnote">A real view of the synthetic demo. Every point is a recorded balance.</p>
          </div>
          <div className="inside-features">
            <Link href="/net-worth"><span className="feature-number">01</span><div><h3>See the whole picture.</h3><p>Assets, liabilities, and the history behind your net worth. All in one considered view.</p></div><MoveUpRight size={22} /></Link>
            <Link href="/transactions"><span className="feature-number">02</span><div><h3>Follow every movement.</h3><p>Go from the overview to the source. Search your activity and open the details that matter.</p></div><MoveUpRight size={22} /></Link>
            <Link href="/dashboard"><span className="feature-number">03</span><div><h3>Find your flow.</h3><p>Move through your workspace with a command menu, fluid charts, and details that come to you.</p><span className="feature-shortcut"><Command size={12} /> / Ctrl K <span>ONE SHORTCUT. YOUR WHOLE WORKSPACE.</span></span></div><MoveUpRight size={22} /></Link>
          </div>
        </div>
      </section>

      <section className="landing-finale" aria-labelledby="finale-title"><div className="finale-lines" aria-hidden="true">{Array.from({length: 9}, (_, index) => <span key={index} style={{transform: `rotate(${index * 12 - 48}deg)`}} />)}</div><div className="landing-eyebrow">A CLEARER PICTURE STARTS HERE</div><h2 id="finale-title">Make room for<br /><em>a new perspective.</em></h2><Link href="/dashboard" className="landing-cta">Step inside Aureli <ArrowUpRight size={21} /></Link><p>No sign-up. No bank connection. Just room to explore.</p></section>
    </main>
    <footer className="landing-footer"><div><Link className="landing-brand" href="/">aureli<span aria-hidden="true">.</span></Link><span>A little clarity goes a long way.</span></div><div><span>USD · Synthetic demo</span><Link href="/settings#methodology">How the numbers work <ArrowUpRight size={13} /></Link><a href="#landing-title">Back to top ↑</a></div></footer>
  </div>;
}
