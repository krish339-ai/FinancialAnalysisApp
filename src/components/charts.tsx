'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useReducedMotion } from './use-reduced-motion';
import { money, type Overview } from '@/domain/finance';
const colors = ['#d2b48e', '#c3e8a5', '#80aaa0', '#a8a0c6', '#a5b77f', '#b4828a', '#78929b', '#c7c2a4'];
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: ReadonlyArray<{ name?: string | number; value?: number | string; payload?: { date?: string; assets?: number; liabilities?: number; netWorth?: number; name?: string } }>; label?: unknown }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return <div className="chart-tooltip"><strong>{point?.date ?? point?.name ?? String(label ?? '')}</strong>{point?.assets !== undefined ? <><span>Net worth <b>{money(point.netWorth ?? 0, true)}</b></span><span>Assets <b>{money(point.assets, true)}</b></span><span>Liabilities <b>{money(point.liabilities ?? 0, true)}</b></span></> : payload.map((p, i) => <span key={i}>{p.name}<b>{money(Number(p.value), true)}</b></span>)}</div>;
}
export function NetChart({ history, expanded = false }: { history: Overview['history']; expanded?: boolean }) {
  const reducedMotion = useReducedMotion();
  if (!history.length) return <div className="empty-state">No balance snapshots for this period.</div>;
  return <div className={expanded ? 'chart net-chart expanded' : 'chart net-chart'} role="img" aria-label={`Net worth history from ${history[0].date} to ${history.at(-1)!.date}. Latest value ${money(history.at(-1)!.netWorth ?? 0)}.`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={history} margin={{ top: 16, right: 6, bottom: 0, left: -17 }}><defs><linearGradient id={expanded ? 'netFillExpanded' : 'netFill'} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c3e8a5" stopOpacity={0.28} /><stop offset="100%" stopColor="#c3e8a5" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#35412d" strokeOpacity={0.7} /><XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={45} tick={{ fill: '#97a28c', fontSize: 12 }} tickFormatter={date => new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} dy={8} /><YAxis domain={['auto', 'auto']} tick={{ fill: '#97a28c', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={value => `$${(value / 100000).toFixed(0)}k`} width={65} tickCount={4} /><Tooltip content={<ChartTooltip />} /><Area type="stepAfter" dataKey="netWorth" name="Net worth" stroke="#c3e8a5" strokeWidth={2.5} fill={`url(#${expanded ? 'netFillExpanded' : 'netFill'})`} isAnimationActive={!reducedMotion} animationDuration={700} animationEasing="ease-in-out" connectNulls={false} activeDot={{ r: 5, stroke: '#101c20', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer></div>;
}
export function ExpenseChart({ data, total }: { data: { name: string; value: number }[]; total: number }) {
  const reducedMotion = useReducedMotion();
  const positive = data.filter(d => d.value > 0);
  if (!positive.length) return <div className="empty-state">No posted expenses in this period.</div>;
  return <div className="donut-wrap" role="img" aria-label={`Net expenses ${money(total)}. ${positive.map(d => `${d.name}: ${money(d.value)}`).join(', ')}`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={positive} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="71%" outerRadius="94%" paddingAngle={3} cornerRadius={3} stroke="none" isAnimationActive={!reducedMotion} animationDuration={700} animationEasing="ease-in-out">{positive.map((d, i) => <Cell key={d.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer><div className="donut-center"><span>{positive.length}</span><small>categories</small></div></div>;
}
export function IncomeBars({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return <div className="source-bars">{data.length ? data.map((d, i) => <div className="source-row" key={d.name}><div><span><i style={{ background: ['#c3e8a5', '#8da986', '#d2cba4'][i % 3] }} />{d.name}</span><strong>{money(d.value)} <small>{total > 0 ? (d.value / total * 100).toFixed(1) : 0}%</small></strong></div><div className="bar-track"><span style={{ width: `${total > 0 ? d.value / total * 100 : 0}%`, background: ['#c3e8a5', '#8da986', '#d2cba4'][i % 3] }} /></div></div>) : <div className="empty-state">No income in this period.</div>}</div>;
}
export function MonthlyChart({ data, kind }: { data: { month: string; value: number }[]; kind: 'income' | 'expenses' }) {
  const reducedMotion = useReducedMotion();
  return <div className="chart expanded" role="img" aria-label={`Monthly ${kind} totals`}><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: -10, top: 20 }}><CartesianGrid vertical={false} stroke="#35412d" strokeOpacity={0.7} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a7b49d', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#a7b49d', fontSize: 12 }} tickFormatter={v => `$${(v / 100000).toFixed(0)}k`} /><Tooltip cursor={{ fill: '#ffffff06' }} content={<ChartTooltip />} /><Bar dataKey="value" name={kind === 'income' ? 'Income' : 'Net expenses'} fill={kind === 'income' ? '#c3e8a5' : '#d2b48e'} radius={[5, 5, 0, 0]} maxBarSize={38} isAnimationActive={!reducedMotion} animationDuration={700} animationEasing="ease-in-out" /></BarChart></ResponsiveContainer></div>;
}
export { colors };
