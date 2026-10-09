# Aureli product requirements and architecture

Aureli helps individuals understand their financial position through an accurate, calm, visual dashboard. The first release is a demonstrable synthetic-data experience, with financial rules and a relational foundation that can support authenticated personal accounts later.

## A Product requirements

Primary journey: open Dashboard, inspect net worth and trailing-period cash flow, change the reporting window, and open supporting analysis or transactions. Success means every displayed amount traces to dated balances or explicitly classified transactions, and each visible action works.

The first slice includes Dashboard, Accounts, Transactions, Net Worth, Income, Expenses, and Settings; four interactive dashboard cards; historical charts; transaction search and filters; a browser-session demo account flow; deterministic insights; and automated calculation and browser tests. Demo data is unmistakably synthetic and never presented as a bank connection. The app does not accept real personal financial records yet.

Deferred: authenticated persistent writes, complete account lifecycle, editable ledger, production CSV imports, household permissions, bank connections, and AI. CSV normalization and database structures may be prepared without representing those workflows as shipped.

## B Recommended architecture

Use a modular Next.js App Router monolith: React/TypeScript presentation, server components and route handlers, application services, pure financial domain functions, and Prisma/PostgreSQL persistence. Tailwind provides styling tokens, shadcn-style Radix primitives provide accessible interactions, Recharts provides charts, and Lucide supplies icons. Zod validates boundaries; Papa Parse normalizes CSV; Vitest and Playwright validate behavior.

The demo repository serves deterministic synthetic data without requiring a database. A separate Prisma seed persists the same data for inspection. Domain functions have no React or HTTP dependency. Money is integer cents, currency is explicit, and sums are guarded against unsafe integers. PostgreSQL uses BigInt for amounts. Serialization must validate conversion to safe JavaScript integers.

Trade-off: this provides a reproducible demonstration while authenticated data access is developed separately. Database configuration and schema are provided now; authenticated Prisma-backed application writes are a later milestone. No anonymous endpoint writes financial records. Before enabling real data, adopt an established OIDC authentication library/provider, derive membership from the verified server session, and scope every query and mutation to that membership. Never trust a client-supplied owner ID.

Future integration adapters expose connect, list accounts, balances, transactions, normalize, sync status, disconnect, and revoke consent. Provider identifiers remain separate from internal IDs. Secrets remain server-side. No bank credentials or fake live connections.

## C Entities and relationships

- User has many WorkspaceMemberships; Workspace has members, accounts, categories, imports, and integration connections. An individual initially owns one workspace.
- Institution has many Accounts. Account belongs to a Workspace and optionally an Institution or IntegrationConnection.
- Account has dated BalanceSnapshots, Transactions, and optional LoanDetails. A debit PaymentInstrument references a checking Account and never adds another asset.
- Manual valued property is an Account of type MANUAL_ASSET, with dated valuation snapshots and no inferred price history.
- Transaction belongs to an Account, Workspace, and optional Category/ImportBatch; stores explicit kind, direction, status, currency, source, external ID, and fingerprint. Transfer links associate two transaction legs without adding income or expense.
- ImportBatch has ImportRows with row number, errors, normalized payload, and status. Workspace plus fingerprint supplies import idempotency.
- UserPreference stores reporting timezone and display currency. IntegrationConnection stores provider metadata and sync status; credentials must use a separate encrypted secret reference.

Account and category references use workspace-scoped composite foreign keys to prevent cross-workspace linkage. Archive timestamps preserve historical records. Snapshots are unique by account/date. Ledger activity never silently replaces balance snapshots.

## Financial rules

- Currency: USD only for this slice. Reject mixed currencies; do not add currencies or fabricate FX rates.
- Net worth is assets minus liabilities at a point in time. Liability balances are positive amounts owed. Credit balances on cards can be negative liabilities.
- Only posted INCOME adds income. Only posted EXPENSE adds expense. REFUND reduces expense. TRANSFER, CARD_PAYMENT, LOAN_PRINCIPAL, and LOAN_PROCEEDS are excluded from both totals. Interest is a separate EXPENSE entry.
- Direction is CREDIT or DEBIT for cash movement. Kind defines the economics; direction alone never classifies income or expenses. Pending transactions remain visible but do not affect posted totals or snapshots.
- 1M means 30 calendar dates including the selected as-of date in America/New_York. The demo as-of date is 2026-10-09. ISO date-only records represent reporting dates, with inclusive start and end; timestamp ingestion must convert to the workspace timezone first. 3M/6M/9M/1Y mean 90/180/270/365 dates. All Time starts at the first available snapshot.
- Comparisons use the preceding equal-length window for flows; net-worth movement compares period-end with the snapshot immediately before the window. Percentage is unavailable when the prior value is zero, negative, or missing.
- Historical charts only use recorded snapshots. Do not interpolate missing balances into asserted observations. A historical total is unavailable if an eligible account has no snapshot. Show freshness and completeness explicitly.
- All historical demo snapshots reconcile with opening balances and posted synthetic account activity. Liability debits increase debt and liability credits reduce it. Manual assets carry explicit monthly valuation observations. No investment return is inferred from income.
- Mortgage/auto debt without a corresponding property valuation produces an incomplete-net-worth notice.

## D Visual direction

Deep ink canvas (#090E1A), quiet navy surfaces, fine blue-gray borders, and luminous but restrained emerald, blue, violet, and amber accents. A fixed desktop sidebar anchors the brand and seven destinations. The main area opens with a concise overview, a reporting control, and Add Account. Four generous cards form a two-column grid: an emerald net-worth area chart, blue source-based income bars, a violet expense donut and category legend, and a compact transaction list with both credits and debits.

Use strong currency typography with tabular numerals, generous whitespace, rounded 20px surfaces, and subdued secondary text. Each card has an explicit accessible detail link; nested chart controls remain independent. Mobile stacks the cards and uses a compact navigation menu. Respect reduced motion, visible keyboard focus, and accessible dialog titles/descriptions. No ornamental inactive controls.

## E Directory structure

```text
src/app/                    App Router pages, loading/error states, read-only APIs
src/components/             Shell, dashboard cards, charts, explorer and dialogs
src/components/ui/          Accessible shared primitives
src/domain/                 Money, classification, dates, snapshot calculations
src/data/                   Deterministic synthetic dataset
src/server/                 Read services, ownership boundary, Prisma adapter
src/integrations/           Provider-independent contract
src/imports/                CSV parsing, normalization, fingerprints
prisma/                     Schema, SQL migrations, reproducible seed
tests/                      Vitest rules and Playwright journeys
docs/                       Product decisions and delivery record
public/samples/             Synthetic CSV template
```

## F Prioritized milestones

1. Architecture and design: requirements, money/date conventions, ER model, and tokens.
2. Foundation: Next.js shell, navigation, database schema/migration, configuration.
3. Financial data: deterministic 12-month ledger/snapshots and tested calculations.
4. Dashboard: four working interactive cards, date controls, supporting calculations.
5. Details: net worth, income, expenses, searchable transaction explorer.
6. Accounts: demo creation first; authenticated persistence, edits, archive, loan details, and manual balance updates next.
7. Import: normalization/deduplication first; authenticated upload, mapping, preview, confirmation, and history next.
8. Quality: typecheck, production build, unit/browser checks, responsive visual review, and handoff documentation.

The current execution targets milestones 1–5 and a bounded demo of account creation. Later capabilities remain explicitly listed as open work.

## G Product decisions and open questions

Confirmed: working brand Aureli; USD; America/New_York. Assumption: a single-person workspace is the first customer; desktop and mobile web are both supported. Synthetic reference date is fixed for reproducible demos, not claimed as today's synchronized data.

Before real-data release, the Product Owner must choose deployment region/host, identity provider and sign-in methods, privacy/retention policy, and the first supported bank CSV formats. Multi-currency, household invitations, and valuation cadence require separate product decisions. None blocks the isolated demonstration.

## Technical references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Prisma ORM 7](https://www.prisma.io/docs/orm/v7)

Package versions are pinned by the lockfile and validated by build/tests in this repository.
