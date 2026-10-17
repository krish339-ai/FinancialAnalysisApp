'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Command, MoveUpRight, Pause, Play, Plus } from 'lucide-react';
import { FinancialSculpture } from './financial-sculpture';
import { useReducedMotion } from './use-reduced-motion';
import { money } from '@/domain/finance';

export type LandingData = {
  netWorth: number; assets: number; liabilities: number; income: number; expenses: number;
  asOf: string; history: { date: string; netWorth: number | null }[];
};

const perspectives = [
  { name: 'The whole picture', label: 'TOTAL NET WORTH', note: 'Everything you own. Everything you owe. One clear perspective.', href: '/net-worth', link: 'Explore net worth' },
  { name: 'Money in motion', label: 'INCOME · LAST 30 DAYS', note: 'Follow the sources of your progress, from payday to the little extras.', href: '/income', link: 'Explore income' },
  { name: 'Room to grow', label: 'PERIOD SURPLUS', note: 'Income less net expenses. See the room your everyday decisions create.', href: '/expenses', link: 'Explore cash flow' },
];

function HistoryGraphic({ history }: { history: LandingData['history'] }) {
  const values = history.filter((point): point is { date: string; netWorth: number } => point.netWorth !== null);
  if (!values.length) return null;
  const min = Math.min(...values.map(point => point.netWorth));
  const max = Math.max(...values.map(point => point.netWorth));
  const points = values.map((point, index) => ({ x: 12 + index / Math.max(1, values.length - 1) * 476, y: 140 - (point.netWorth - min) / Math.max(1, max - min) * 110 }));
  const path = points.map((point, index) => index ? `H${point.x}V${point.y}` : `M${point.x},${point.y}`).join(' ');
  return <svg viewBox="0 0 500 170" role="img" aria-label={`Recorded net worth from ${values[0].date} to ${values.at(-1)!.date}`}>
    <defs><linearGradient id="landing-history-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c3e8a5" stopOpacity=".17" /><stop offset="1" stopColor="#c3e8a5" stopOpacity="0" /></linearGradient></defs>
    {[40, 90, 140].map(y => <path key={y} d={`M0 ${y}H500`} stroke="#ffffff0c" />)}
    <path d={`${path}V170H12Z`} fill="url(#landing-history-fill)" /><path d={path} fill="none" stroke="#c3e8a5" strokeWidth="1.8" />
    <circle cx={points.at(-1)!.x} cy={points.at(-1)!.y} r="3.5" fill="#e1f4c9" />
  </svg>;
}

export function LandingPage({ data }: { data: LandingData }) {
  const [mode, setMode] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const perspective = perspectives[mode];
  const value = [data.netWorth, data.income, data.income - data.expenses][mode];
  return <div className="aureli-landing">
    <header className="landing-header">
      <Link className="landing-brand" href="/" aria-label="Aureli home"><ChartNoAxesCombined size={25} strokeWidth={1.5} />aureli<span aria-hidden="true">.</span></Link>
      <nav aria-label="Landing navigation"><a href="#perspectives">The perspective</a><a href="#inside">Inside Aureli</a></nav>
      <Link className="landing-nav-cta" href="/dashboard">Enter workspace <ArrowUpRight size={17} /></Link>
    </header>

    <main id="main-content" className="landing-main">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="hero-copy">
          <div className="landing-eyebrow"><span /> FINANCIAL CLARITY, BEAUTIFULLY CONNECTED</div>
          <h1 id="landing-title">Your money.<br /><em>A whole new</em><br />perspective.</h1>
          <p>A little less noise. A much bigger picture.<br />Meet a more thoughtful way to see your money.</p>
          <div className="hero-actions"><Link className="landing-cta" href="/dashboard">Find your perspective <ArrowUpRight size={21} /></Link><a className="landing-text-link" href="#perspectives">Take a closer look <ArrowDown size={15} /></a></div>
          <div className="hero-caption"><span className="caption-line" /> Your financial world. Finally in focus.</div>
        </div>

        <figure className="hero-art" aria-label="Interactive generative sculpture: a luminous woven form">
          <div className="art-coordinate top"><Plus size={13} /><span>FIG. 01 / THE AURELI PERSPECTIVE</span></div>
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <FinancialSculpture mode={mode} paused={paused || reducedMotion} />
          <span className="art-axis axis-left">A DIFFERENT POINT OF VIEW</span>
          <span className="art-pin pin-assets"><span /> ASSETS <strong>{money(data.assets)}</strong></span>
          <span className="art-pin pin-liabilities"><span /> LIABILITIES <strong>{money(data.liabilities)}</strong></span>
          <figcaption className="art-caption"><span>ORDER, IN EVERY ORBIT.</span><span>Generative artwork · Move to explore</span></figcaption>
          <button type="button" className="art-pause" onClick={() => setPaused(value => !value)} disabled={reducedMotion} aria-label={reducedMotion ? 'Animation disabled by reduced-motion preference' : paused ? 'Play artwork animation' : 'Pause artwork animation'}>{paused || reducedMotion ? <Play size={14} /> : <Pause size={14} />}</button>
        </figure>

        <div className="perspective-bar" id="perspectives">
          <div className="perspective-selector" role="group" aria-label="Choose a perspective">{perspectives.map((item, index) => <button type="button" key={item.name} aria-pressed={mode === index} onClick={() => setMode(index)}><span>0{index + 1}</span>{item.name}<ArrowUpRight size={16} /></button>)}</div>
          <div className="perspective-reading" aria-live="polite" aria-atomic="true"><span>{perspective.label}</span><strong>{money(value)}<small>USD</small></strong><p>{perspective.note}</p><Link href={perspective.href}>{perspective.link} <ArrowRight size={14} /></Link></div>
        </div>
        <div className="landing-disclosure"><span><span className="landing-status-dot" /> An interactive demo. Entirely fictional data.</span><span>REFERENCE DATE / {data.asOf}</span></div>
      </section>

      <section className="landing-inside" id="inside" aria-labelledby="inside-title">
        <div className="section-intro"><div className="landing-eyebrow">01 / THE ART OF SEEING CLEARLY</div><h2 id="inside-title">More connected.<br /><em>Less complicated.</em></h2><p>Your accounts tell one story. Your activity tells another. Aureli brings them into the same frame.</p></div>
        <div className="inside-composition">
          <div className="landing-product-preview">
            <div className="preview-topline"><span><span className="landing-status-dot" /> YOUR FINANCIAL PICTURE</span><span>01 — 06</span></div>
            <div className="preview-title"><span>Net worth</span><ArrowUpRight size={19} /></div><strong className="preview-value">{money(data.netWorth)}</strong>
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
