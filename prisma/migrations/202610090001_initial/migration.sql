-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'MORTGAGE', 'AUTO_LOAN', 'SOLAR_LOAN', 'PERSONAL_LOAN', 'OTHER_LOAN', 'MANUAL_ASSET');

-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('INCOME', 'EXPENSE', 'REFUND', 'TRANSFER', 'CARD_PAYMENT', 'LOAN_PRINCIPAL', 'LOAN_PROCEEDS');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('POSTED', 'PENDING');

-- CreateEnum
CREATE TYPE "RecordSource" AS ENUM ('SYNTHETIC', 'MANUAL', 'CSV', 'PROVIDER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "externalSubject" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "institutionId" TEXT,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "openingBalance" BIGINT NOT NULL,
    "openingDate" DATE NOT NULL,
    "mask" TEXT,
    "archivedAt" TIMESTAMP(3),
    "creditLimit" BIGINT,
    "relatedAssetId" TEXT,
    "externalId" TEXT,
    "connectionId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanDetails" (
    "accountId" TEXT NOT NULL,
    "originalPrincipal" BIGINT NOT NULL,
    "annualRateBasisPoints" INTEGER NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "maturityDate" DATE,
    "regularPayment" BIGINT NOT NULL,

    CONSTRAINT "LoanDetails_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "PaymentInstrument" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "mask" TEXT NOT NULL,

    CONSTRAINT "PaymentInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceSnapshot" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "balance" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "source" "RecordSource" NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "direction" "Direction" NOT NULL,
    "kind" "TransactionKind" NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'POSTED',
    "source" "RecordSource" NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "externalId" TEXT,
    "fingerprint" TEXT,
    "importBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRelationship" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    CONSTRAINT "TransferRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errors" JSONB,
    "normalized" JSONB,

    CONSTRAINT "ImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalConnectionId" TEXT NOT NULL,
    "secretReference" TEXT,
    "status" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "consentRevokedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_externalSubject_key" ON "User"("externalSubject");

-- CreateIndex
CREATE INDEX "Account_workspaceId_archivedAt_idx" ON "Account"("workspaceId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_workspaceId_key" ON "Account"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_connectionId_externalId_key" ON "Account"("connectionId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSnapshot_accountId_date_key" ON "BalanceSnapshot"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_workspaceId_key" ON "Category"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_workspaceId_name_key" ON "Category"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "Transaction_workspaceId_date_idx" ON "Transaction"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_workspaceId_key" ON "Transaction"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_workspaceId_fingerprint_key" ON "Transaction"("workspaceId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_accountId_externalId_key" ON "Transaction"("accountId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRelationship_fromId_key" ON "TransferRelationship"("fromId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRelationship_toId_key" ON "TransferRelationship"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRelationship_fromId_workspaceId_key" ON "TransferRelationship"("fromId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRelationship_toId_workspaceId_key" ON "TransferRelationship"("toId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportBatch_id_workspaceId_key" ON "ImportBatch"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportBatch_workspaceId_fileHash_key" ON "ImportBatch"("workspaceId", "fileHash");

-- CreateIndex
CREATE UNIQUE INDEX "ImportRow_batchId_rowNumber_key" ON "ImportRow"("batchId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_id_workspaceId_key" ON "IntegrationConnection"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_workspaceId_provider_externalConnecti_key" ON "IntegrationConnection"("workspaceId", "provider", "externalConnectionId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_relatedAssetId_workspaceId_fkey" FOREIGN KEY ("relatedAssetId", "workspaceId") REFERENCES "Account"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_connectionId_workspaceId_fkey" FOREIGN KEY ("connectionId", "workspaceId") REFERENCES "IntegrationConnection"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDetails" ADD CONSTRAINT "LoanDetails_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInstrument" ADD CONSTRAINT "PaymentInstrument_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_workspaceId_fkey" FOREIGN KEY ("accountId", "workspaceId") REFERENCES "Account"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_workspaceId_fkey" FOREIGN KEY ("categoryId", "workspaceId") REFERENCES "Category"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_importBatchId_workspaceId_fkey" FOREIGN KEY ("importBatchId", "workspaceId") REFERENCES "ImportBatch"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRelationship" ADD CONSTRAINT "TransferRelationship_fromId_workspaceId_fkey" FOREIGN KEY ("fromId", "workspaceId") REFERENCES "Transaction"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRelationship" ADD CONSTRAINT "TransferRelationship_toId_workspaceId_fkey" FOREIGN KEY ("toId", "workspaceId") REFERENCES "Transaction"("id", "workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
