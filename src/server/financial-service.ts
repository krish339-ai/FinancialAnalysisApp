import 'server-only';
import { createDemo } from '@/data/demo';
import { overview } from '@/domain/finance';
import type { Range } from '@/domain/types';
// Only the synthetic repository is reachable in this release. No client owner IDs are accepted.
const dataset = createDemo();
export function getDemoData() { return dataset; }
export function getOverview(range: Range) { return overview(dataset, range); }
