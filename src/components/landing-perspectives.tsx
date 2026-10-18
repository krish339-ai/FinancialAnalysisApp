'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { money } from '@/domain/finance';
import { ArtworkPicker, useAppearance } from './appearance-context';
import { LandingArtwork } from './landing-artwork';
import type { LandingData } from './landing-page';

const views = [
  { name: 'Net worth', subtitle: 'The whole picture', label: 'ASSETS MINUS LIABILITIES', word: 'BALANCE', href: '/net-worth?range=1M', link: 'Explore net worth' },
  { name: 'Income', subtitle: 'Money in motion', label: 'POSTED INCOME · 30 DAYS', word: 'FLOW IN', href: '/income?range=1M', link: 'Explore income' },
  { name: 'Surplus', subtitle: 'Room to grow', label: 'INCOME MINUS NET EXPENSES', word: 'ROOM TO GROW', href: '/dashboard?range=1M', link: 'Explore income & spending' },
];
const explanations = {
  weave: ['An amber debt layer separates, revealing the luminous core you keep.', 'Incoming streams thread into the same woven form.', 'Expenses peel away; the remaining weave opens into room to grow.'],
  orbit: ['Asset orbits settle around a bright core as the debt orbit moves apart.', 'Income sources send trails inward, gathering into your financial world.', 'Spending leaves the orbit; the retained halo expands into open space.'],
};

export function LandingPerspectives({ data }: { data: LandingData }) {
  const [mode, setMode] = useState(0);
  const [sequence, setSequence] = useState(0);
  const { artwork } = useAppearance();
  const view = views[mode];
  const surplus = data.income - data.expenses;
  const values = [data.netWorth, data.income, surplus];
  const description = mode === 2 && surplus < 0 ? 'Expenses exceed income; this period has a deficit.' : explanations[artwork][mode];
  const legend = mode === 0 ? ['What you own', 'What you owe', 'What remains'] : mode === 1 ? data.incomeSources.slice(0, 3).map(source => source.name) : ['Income in', 'Expenses out', surplus < 0 ? 'Period deficit' : 'Surplus retained'];
  return <section className="landing-hero sculpture-hero" aria-labelledby="landing-title">
    <div className="hero-copy">
      <div className="landing-eyebrow"><span /> FINANCIAL CLARITY, BEAUTIFULLY CONNECTED</div>
      <h1 id="landing-title">Your money.<br /><em>A whole new</em><br />perspective.</h1>
      <p>A little less noise. A much bigger picture.<br />Meet a more thoughtful way to see your money.</p>
      <div className="hero-actions"><Link className="landing-cta" href="/dashboard">Find your perspective <ArrowUpRight size={21} /></Link><a className="landing-text-link" href="#perspectives">Take a closer look <ArrowDown size={15} /></a></div>
      <div className="hero-caption"><span className="caption-line" /> Your financial world. Finally in focus.</div>
    </div>
    <figure className="hero-art" aria-label="Interactive financial artwork">
      <div className="hero-art-toolbar"><span><Plus size={13} /> YOUR PERSPECTIVE</span><ArtworkPicker /></div>
      <LandingArtwork mode={mode} sequence={sequence} description={description} />
      <figcaption><span className="art-meaning">{mode === 2 && surplus < 0 ? 'PERIOD DEFICIT' : view.word}</span><div className="art-legend">{legend.map((label, index) => <span key={label} className={mode !== 1 && index === 1 ? 'warm' : ''}><i />{label}</span>)}</div><span className="art-note">Illustrative motion · Not to scale</span></figcaption>
    </figure>
    <div className="perspective-bar">
      <div className="perspective-selector" id="perspectives" role="group" aria-label="Choose a financial perspective">{views.map((item, index) => <button key={item.name} type="button" aria-pressed={mode === index} aria-controls="perspective-reading" onClick={() => { setMode(index); setSequence(value => value + 1); }}>
        <span className="perspective-choice-top"><span>0{index + 1} · {index === 2 && surplus < 0 ? 'Deficit' : item.name}</span><ArrowUpRight size={15} /></span><strong className="perspective-value">{values[index] === null ? 'Unavailable' : money(values[index], true)}</strong><small>{index === 0 ? 'Current net worth · USD' : 'Last 30 days · USD'}</small>
      </button>)}</div>
      <div className="perspective-reading" id="perspective-reading" aria-live="polite" aria-atomic="true">
        <p><span className="perspective-label">{mode === 2 && surplus < 0 ? 'PERIOD DEFICIT' : view.label}</span>{description}</p><Link href={view.href}>{view.link}<ArrowRight size={14} /></Link>
      </div>
    </div>
    <div className="landing-disclosure"><span><span className="landing-status-dot" /> Fictional demo · Select a perspective again to replay</span><span>30 DAYS / {data.period.start} — {data.period.end}</span></div>
  </section>;
}
