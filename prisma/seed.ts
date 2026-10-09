import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createDemo, DEMO_WORKSPACE } from '../src/data/demo';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? 'postgresql://aureli:aureli_local_only@localhost:5432/aureli' }) });
const date = (d: string) => new Date(d + 'T00:00:00Z');
async function main() {
  const data = createDemo();
  // Upserts target fixed synthetic IDs only. No deleting or overwriting user workspaces.
  const existing = await prisma.workspace.findUnique({ where: { id: DEMO_WORKSPACE } });
  if (existing && !existing.isDemo) throw new Error('Refusing to seed a non-demo workspace.');
  await prisma.$transaction(async tx => {
    await tx.user.upsert({ where: { id: 'demo-user' }, update: {}, create: { id: 'demo-user', externalSubject: 'synthetic:demo-user', displayName: 'Jordan Davis' } });
    await tx.workspace.upsert({ where: { id: DEMO_WORKSPACE }, update: {}, create: { id: DEMO_WORKSPACE, name: 'Jordan Davis · Synthetic', isDemo: true } });
    await tx.membership.upsert({ where: { userId_workspaceId: { userId: 'demo-user', workspaceId: DEMO_WORKSPACE } }, update: {}, create: { userId: 'demo-user', workspaceId: DEMO_WORKSPACE } });
    // Create manual assets first so loan asset references exist.
    for (const a of [...data.accounts].sort((a, b) => Number(!!a.relatedAssetId) - Number(!!b.relatedAssetId))) {
      await tx.institution.upsert({ where: { id: `demo-institution-${a.id}` }, update: {}, create: { id: `demo-institution-${a.id}`, name: a.institution } });
      await tx.account.upsert({ where: { id: a.id }, update: {}, create: { id: a.id, workspaceId: a.workspaceId, name: a.name, institutionId: `demo-institution-${a.id}`, type: a.type, currency: a.currency, openingBalance: BigInt(a.openingBalance), openingDate: date(a.openingDate), mask: a.mask, relatedAssetId: a.relatedAssetId } });
    }
    await tx.loanDetails.upsert({ where: { accountId: 'mortgage' }, update: {}, create: { accountId: 'mortgage', originalPrincipal: 30000000n, annualRateBasisPoints: 514, termMonths: 360, startDate: date('2023-01-01'), maturityDate: date('2053-01-01'), regularPayment: 219500n } });
    // Interest in the demo is an explicit fixed ledger observation, not an amortization calculation.
    const categories = [...new Set(data.transactions.map(t => t.category))];
    for (let i = 0; i < categories.length; i++) await tx.category.upsert({ where: { id: `demo-category-${i}` }, update: {}, create: { id: `demo-category-${i}`, workspaceId: DEMO_WORKSPACE, name: categories[i] } });
    await tx.balanceSnapshot.createMany({ skipDuplicates: true, data: data.snapshots.map(s => ({ ...s, date: date(s.date), balance: BigInt(s.balance) })) });
    await tx.transaction.createMany({ skipDuplicates: true, data: data.transactions.map(t => ({ id: t.id, workspaceId: t.workspaceId, accountId: t.accountId, categoryId: `demo-category-${categories.indexOf(t.category)}`, date: date(t.date), description: t.description, amount: BigInt(t.amount), currency: t.currency, direction: t.direction, kind: t.kind, status: t.status, source: t.source, recurring: t.recurring })) });
    const groups = [...new Set(data.transactions.flatMap(t => t.transferId ? [t.transferId] : []))];
    for (const id of groups) { const pair = data.transactions.filter(t => t.transferId === id); const from = pair.find(t => t.direction === 'DEBIT'); const to = pair.find(t => t.direction === 'CREDIT'); if (from && to) await tx.transferRelationship.upsert({ where: { id }, update: {}, create: { id, workspaceId: DEMO_WORKSPACE, fromId: from.id, toId: to.id } }); }
  }, { timeout: 60000 });
  console.log(`Seeded synthetic dataset: ${data.accounts.length} accounts, ${data.transactions.length} transactions, ${data.snapshots.length} dated balances.`);
}
main().catch(() => { console.error('Seed failed. Check database connectivity and schema.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
