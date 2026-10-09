import { PageHeader } from '@/components/dashboard';
import { AccountsView } from '@/components/accounts-view';
import { getDemoData } from '@/server/financial-service';
export const metadata = { title: 'Accounts' };
export default function Accounts() { return <><PageHeader eyebrow="EVERY PIECE OF THE PICTURE" title="Your financial home base." description="A clear view of what you own, what you owe, and where it lives." /><AccountsView data={getDemoData()} /></>; }
