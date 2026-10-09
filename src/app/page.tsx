import { Dashboard } from '@/components/dashboard';
import { getDemoData, getOverview } from '@/server/financial-service';
import { parseRange } from '@/server/params';
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const params = await searchParams; const range = parseRange(params.range); return <Dashboard data={getDemoData()} summary={getOverview(range)} range={range} />; }
