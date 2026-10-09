import { AnalysisView } from '@/components/analysis-view';
import { getDemoData, getOverview } from '@/server/financial-service';
import { parseRange, textParam } from '@/server/params';
export const metadata = { title: 'Income analysis' };
export default async function Income({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const p = await searchParams; const range = parseRange(p.range); return <AnalysisView kind="income" data={getDemoData()} summary={getOverview(range)} range={range} category={textParam(p.category)} />; }
