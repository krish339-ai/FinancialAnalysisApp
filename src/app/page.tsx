import { LandingPage } from '@/components/landing-page';
import { getDemoData, getOverview } from '@/server/financial-service';
import { redirect } from 'next/navigation';

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  // Preserve existing bookmarked dashboard reporting windows.
  if (typeof params.range === 'string') redirect('/dashboard?range=' + encodeURIComponent(params.range));
  const summary = getOverview('1M');
  return <LandingPage data={{ netWorth: summary.current.netWorth ?? 0, assets: summary.current.assets, liabilities: summary.current.liabilities, income: summary.totals.income, expenses: summary.totals.expenses, history: summary.history, asOf: getDemoData().asOf }} />;
}
