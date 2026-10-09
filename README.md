# FinancialAnalysisApp

A premium dark financial dashboard. The application's display brand is Aureli. The working vertical slice uses a reconciled synthetic dataset, real calculations, interactive charts, dedicated analysis pages, and a searchable transaction explorer.

**Author: Krishna Kallamadi** · [Connect on LinkedIn](https://www.linkedin.com/in/krishna-kishore-kallamadi-a22b498/)

## About the author

I'm Krishna Kallamadi, a data enthusiast with 16+ years of experience with various on-prem and cloud databases across healthcare and insurance. I began my career in 2009 and have spent more than a decade supporting mission-critical healthcare databases. My work spans database administration, performance tuning, data analytics, data migration, data engineering, data architecture, cloud engineering, and AI engineering, with a focus on automation and data security.

I've expanded into AI, earning the AWS Certified AI Practitioner certification and building AI-powered database intelligence tools. I'm working toward a future as an AI Data Architect, bringing together database expertise, data engineering, and a security-first approach to intelligent, autonomous platforms.

## Run locally

Requirements: Node.js 24 LTS and pnpm 11.25.0. PostgreSQL is optional for the read-only demo.

```sh
pnpm install --frozen-lockfile
pnpm db:generate
pnpm dev
```

Open http://127.0.0.1:3000. The demo requires no credentials, bank connection, API key, or environment file. If pnpm is not installed, install the matching version with `npm install -g pnpm@11.25.0`.

For a production preview:

```sh
pnpm build
pnpm start
```

## What works now

- Responsive dashboard with net worth, income, expenses, and recent debit/credit activity.
- Six reporting windows and interactive charts derived from recorded synthetic data.
- Net worth, income, and expense detail pages with supporting account records.
- Transaction search, sorting, date/account/category/type/status/amount filters, detail dialogs, and filtered CSV export.
- Six reference accounts, account details, and account-level activity.
- Accessible multi-step Add Account preview, isolated in browser session storage. Preview accounts are explicitly excluded from reference analytics.
- Settings with calculation methodology, sample CSV download, and session reset.
- Money/date/classification/import domain functions, PostgreSQL schema/migration/seed, and future integration contract.

The prototype does not accept real financial data. Authentication, persistent application writes, account editing/archive, ledger editing UI, and CSV upload/mapping/confirmation remain later milestones. The seeded PostgreSQL database is a development foundation; current application reads use the deterministic synthetic repository.

## Optional PostgreSQL foundation

Copy `.env.example` to `.env`, then with Docker Desktop running:

```sh
docker compose up -d
pnpm db:deploy
pnpm db:seed
```

The development database binds only to loopback. Its example password is for local development, not deployment. Schema changes use `pnpm db:migrate --name describe_change`; commit each generated migration. `pnpm db:generate` regenerates the typed client.

The seed targets only the fixed synthetic workspace, refuses an existing non-demo workspace with that ID, and uses idempotent inserts. No real accounts should be added to this development demo workspace. The initial SQL adds composite foreign keys to keep account, category, import, and transfer references inside their workspace. Authentication and complete request-level authorization are prerequisites for exposing database writes.

## Verification

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Playwright uses installed Microsoft Edge by default. On Linux or a machine without Edge, run `pnpm exec playwright install chromium` and remove `channel: 'msedge'` from `playwright.config.ts`. The suite starts a production server automatically, so build first; an existing port-3000 server is reused. Desktop and mobile screenshots go to ignored `artifacts/`; reports go to `playwright-report/`.

## Financial assumptions

Amounts are integer USD cents. The reference date is October 9, 2026, and the reporting timezone is America/New_York. The dataset contains daily snapshots from October 8, 2025 through October 9, 2026. `1M` is the trailing 30 inclusive reporting dates. Percentage comparisons are unavailable when baseline history is missing, zero, or negative.

Income and expenses count posted classifications only. Refunds reduce expenses. Transfers, loan proceeds, loan principal, and credit card repayments do not inflate either total. Principal and interest use separate records. Daily balances reconcile to opening balances and posted activity; the fictional home valuation stays constant. The sample mortgage interest is an observed fixed amount, not an amortization forecast. All fictional institutional names and account masks are synthetic.

CSV utilities accept at most 2 MB and 10,000 rows, require explicit classification, report errors by row, and support mapped amount or debit/credit columns. A normalized fingerprint identifies duplicate candidates. Identical legitimate same-day transactions can share a fingerprint, so future import confirmation must allow review or a provider transaction ID before discarding records.

## Project documentation

- [Product requirements, architecture, entities, design, scope and open decisions](docs/PRODUCT.md)
- [Development record and milestone status](docs/DELIVERY.md)

The application uses Next.js App Router, TypeScript, React, Tailwind, shadcn-compatible Radix primitives, Recharts, Lucide, Prisma/PostgreSQL, Zod, Papa Parse, Vitest, and Playwright. Exact resolved versions are recorded in `pnpm-lock.yaml`.

## Repository contents and privacy

This repository includes application source, documentation, the dependency lockfile, automated tests, the Prisma schema and SQL migration, the synthetic seed, and `public/samples/transactions.csv`. All supplied financial records are fictional.

Local environment files, dependencies, generated Prisma clients, build output, test reports, screenshots, generated project documents, uploads, and database exports are excluded. `.env.example` contains only a documented local-development configuration; never replace it with real credentials. Keep personal financial records out of this repository.
