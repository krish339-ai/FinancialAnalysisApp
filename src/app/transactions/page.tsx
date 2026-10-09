import type { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard';
import { TransactionExplorer } from '@/components/transaction-explorer';
import { getDemoData } from '@/server/financial-service';
import { textParam } from '@/server/params';
export const metadata: Metadata = { title: 'Transactions' };
export default async function Transactions({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const data = getDemoData(); const p = await searchParams; return <><PageHeader eyebrow="FOLLOW THE DETAILS" title="Every move, in one place." description="Credits, debits and everything in between. Always clearly classified." /><TransactionExplorer records={data.transactions} accounts={data.accounts} initialSelected={textParam(p.selected)} initialCategory={textParam(p.category)} /></>; }
