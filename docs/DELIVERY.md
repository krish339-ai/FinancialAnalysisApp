# Aureli development record

The first execution delivers a working synthetic financial intelligence slice. It establishes the product and database design, builds the dashboard and detail views, and tests the financial rules. Real personal financial data remains out of scope until authentication and persistence are connected.

## Milestone status

| Milestone | Delivered | Validation | Remaining and next step |
| --- | --- | --- | --- |
| 1 Architecture and design | PRD, architecture, entity relationships, financial rules, directory structure, visual direction and priorities | Reviewed against the supplied master prompt | Choose deployment region, authentication provider and data retention policy before real-data launch |
| 2 Application foundation | Next.js 16, React 19, TypeScript, Tailwind 4, Radix/shadcn-style primitives, shell and all navigation routes; Prisma 7 schema and migration | Production build and Prisma client generation pass | PostgreSQL migration and seed execution require a running database; none is available in this environment |
| 3 Financial data foundation | Over 12 months of synthetic activity, daily snapshots, money/date/classification functions, CSV normalization and duplicate candidates | 32 unit tests pass, including reconciliation of every account observation | Connect authenticated repository and audit operations |
| 4 Dashboard | Four interactive cards, net-worth range controls, Recharts hover details, source bars, category donut, deterministic insight | Browser journeys and desktop/mobile screenshots | Broader accessibility audit and performance profiling |
| 5 Detailed views | Net-worth contributions and history; income/expense trends; supporting records; transaction filters, details and export | Four detail-page navigation journeys and explorer tests pass | Merchant aggregation, richer custom-date controls, and editable records |
| 6 Account management | Reference account inspection and multi-step session-only creation preview | Create, navigate, reload and reset browser test passes | Secure persistent add/edit/archive, loan details and manual balances |
| 7 CSV import | Sample CSV, column-mapping parser, normalization, size/row limits, row errors and fingerprints | Seven dedicated import utility tests within the 32-test suite | File picker, preview/mapping UI, duplicate review, atomic confirmation and import history; no upload E2E is claimed |
| 8 Quality | Responsive layouts, focus styles, Radix modal handling, loading/error/empty states, safe errors, request range validation | Webpack production build and 18 Playwright tests pass | Database integration tests, authenticated isolation tests and deployment assessment |

## Problem and tools

Expense trackers often blur spending and money movement, and attractive charts can hide missing historical evidence. Aureli separates account balances from activity and makes transaction classification explicit. The design presents net worth, income, expenses, and recent activity as four coordinated entry points.

Tools used: Codex, Next.js App Router, React, TypeScript, Tailwind CSS, Radix primitives with shadcn-compatible configuration, Lucide, Recharts, Prisma, a PostgreSQL relational design, Zod, Papa Parse, Vitest and Playwright. The dependency lockfile records the installed versions. Official Next.js and Prisma documentation informed installation and Prisma 7 adapter configuration.

## Dataset and reconciliation

`src/data/demo.ts` deterministically generates fictional checking, two savings accounts, a residence valuation, a mortgage and a credit card. It covers 2025-10-08 through 2026-10-09. Activity includes payroll, freelance income, savings interest, housing interest and taxes, groceries, dining, shopping, subscriptions, travel, refunds, transfers, card payments and pending authorization.

Each posted entry adjusts the corresponding synthetic balance using asset/liability sign conventions. Every day records an explicit snapshot. Property valuation stays fixed, so whole-period net-worth growth equals posted income less net expenses. Two-legged transfers and principal repayments cancel at the total-net-worth level. Pending authorizations have no balance effect. Tests verify each observation rather than relying on a hand-entered headline total.

## Prompt and iteration record

1. Product Owner supplied the full “Premium Financial Intelligence Platform” master prompt, specifying Next.js, financial accuracy, premium dark visual design and staged delivery.
2. Codex proposed an isolated synthetic first slice and asked for brand, currency and timezone preferences. Product Owner confirmed Aureli, USD and America/New_York.
3. Architecture and financial conventions were saved before application implementation. Authentication and persistent writes were deferred explicitly to avoid presenting anonymous real-data storage as secure.
4. The domain engine and reproducible dataset were implemented together. Charts then consumed server-calculated summaries instead of separately hard-coded display data.
5. The interface was extended into detailed views, filters, CSV export, account inspection and a bounded account-creation preview.
6. Unit checks, production build and browser journeys exposed implementation issues, which were corrected. Desktop and mobile screenshots were reviewed; smaller text was enlarged for readability.
7. The Product Owner selected the Obsidian design and requested smooth chart animations, a command menu, sliding detail panels, and desktop/mobile polish. The interface now has charcoal and emerald surfaces, keyboard destination search, desktop side panels, mobile bottom sheets, a focus-trapped mobile drawer, responsive transaction lists, and reduced-motion support. Financial calculations and reference data are unchanged.

This record describes actions taken during the session. It does not invent additional Product Owner prompts or claim a user acceptance review has occurred.

## Bugs and fixes

- Windows sandbox blocked pnpm realpath access to the workspace. Dependency installation and build/test commands were rerun through explicit tool escalation.
- Prisma rejected transfer relationships without composite unique keys. Added unique `(fromId, workspaceId)` and `(toId, workspaceId)` constraints to match workspace-scoped foreign keys; generation and build then passed.
- The first build could not resolve generated Prisma types because schema generation had failed. Build now runs client generation first, and the schema correction resolved the cause.
- Initial dashboard screenshots revealed small supporting labels. Financial labels and transaction rows were enlarged without changing the underlying numbers.
- A property account has no ledger activity. Its detail state explains dated valuations instead of showing an activity link with no destination.

## Landing-page update

The Product Owner requested a distinctive landing page with original graphics. The new root page uses a custom projected canvas sculpture, pointer response, three selectable financial perspectives, editorial typography, a recorded-balance preview, and direct entry to the application. The working overview moved to `/dashboard`; root reporting-window bookmarks redirect to it. No external graphics dependency or generated image asset is required. The artwork is explicitly decorative, uses the existing demo figures for its annotations, and supports pause, reduced motion, and off-screen suspension.

## Workspace design update

The landing visual direction now spans Overview, Accounts, Transactions, Net Worth, Income, Expenses, and Settings. Shared headers combine ivory and sage typography with a small, pausable generative sculpture. Account cards have decorative contours; chart palettes, tables, filters, command search, creation dialogs, and detail sheets use the same materials. A mobile navigation dock keeps common destinations within thumb reach and opens the existing accessible drawer for the remaining pages. Route entrances and bar reveals honor reduced motion; real financial calculations and data classifications remain unchanged.

## Tests and evidence

`pnpm test` passes 32 tests covering cents parsing, overflow, reporting dates, invalid baselines, classifications, refunds, pending records, missing snapshots, archived history, daily reconciliation, transfer pairing, ownership helpers, metadata-edit validation, CSV normalization and duplicate candidates.

`pnpm db:generate`, `pnpm typecheck`, and `pnpm exec next build --webpack` pass. The standard Turbopack build could not start its CSS worker in this Windows runtime, including outside the sandbox; the Webpack production build succeeds. All 18 installed-Edge browser checks pass in a single production run. Coverage includes dashboard and range switching; four analysis destinations; search/filter/detail/empty states; account creation and reset; CSV export; API validation; desktop/mobile overflow and navigation; command-menu search and keyboard operation; detail-panel focus trapping and restoration; account supporting-activity navigation; widths from 320px through 1440px; reduced-motion behavior; landing artwork and perspective controls; dashboard entry; legacy reporting-window bookmarks; every workspace route at phone, tablet, sidebar-breakpoint, and desktop widths; mobile dock navigation and focus restoration; and workspace artwork controls.

Reviewed screenshots are stored in ignored `artifacts/dashboard-desktop.png`, `artifacts/dashboard-mobile.png`, `artifacts/obsidian-command-menu.png`, `artifacts/obsidian-detail-desktop.png`, `artifacts/obsidian-detail-mobile.png`, `artifacts/obsidian-transactions-mobile.png`, `artifacts/landing-desktop.png`, `artifacts/landing-hero.png`, and `artifacts/landing-mobile.png`. The workspace refresh also includes reviewed desktop and mobile captures for all seven routes at `artifacts/workspace-{route}-{desktop|mobile}.png`, plus `artifacts/workspace-overview.png`. Browser reports and traces are also ignored. No PostgreSQL instance was available, so migration application and seed execution have not been verified. The ownership tests exercise a service guard; they do not constitute authenticated end-to-end isolation testing.

## Lessons and next release

Financial accuracy improves when classification, money representation and dates are decided before charts. Deterministic fixtures make reconciliation testable. A visual first release can be useful while clearly distinguishing shipped features from preparation for later milestones.

The next recommended slice is established-provider authentication plus a Prisma-backed account repository. It should include server-derived workspace membership, account ownership integration tests, validated persistent writes and audit history. Then connect CSV preview, mapping and confirmed import to that repository. Evaluate production security and privacy before accepting real financial records; no regulatory certification is claimed.
