import type { Range } from '@/domain/types';
import { AddAccount } from './add-account';
import { PeriodControls } from './period-controls';
import { WorkspaceArt } from './workspace-art';

export function PageHeader({ eyebrow, title, accent, description, range, mode = 0, edition = '01' }: {
  eyebrow: string; title: string; accent?: string; description: string; range?: Range; mode?: number; edition?: string;
}) {
  const start = accent ? title.lastIndexOf(accent) : -1;
  return <header className="page-heading">
    <div className="page-heading-copy">
      <div className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</div>
      <h1>{start >= 0 ? <>{title.slice(0, start)}<em>{accent}</em></> : title}</h1>
      <p>{description}</p>
      <div className="page-actions">{range && <PeriodControls value={range} />}<AddAccount /></div>
    </div>
    <WorkspaceArt mode={mode} edition={edition} />
  </header>;
}
