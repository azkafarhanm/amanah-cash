import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

test("Transaction Workspace page embeds SectionHeader and TransactionWorkspaceView without FeaturePlaceholder", () => {
  const pageSrc = source("src/app/(app)/(operator)/operator/transactions/page.tsx");
  assert.match(pageSrc, /SectionHeader/);
  assert.match(pageSrc, /title="Workspace Transaksi"/);
  assert.match(pageSrc, /TransactionWorkspaceView/);
  assert.doesNotMatch(pageSrc, /FeaturePlaceholder/);
});

test("TransactionWorkspaceView uses single-source-of-truth server API and does not recalculate totals client-side", () => {
  const viewSrc = source("src/components/transactions/workspace/transaction-workspace-view.tsx");
  assert.match(viewSrc, /\/api\/operator\/transactions/);
  assert.match(viewSrc, /WorkspaceTransactionTable/);
  assert.match(viewSrc, /WorkspaceTransactionCards/);
  assert.match(viewSrc, /WorkspacePaginationBar/);
  assert.match(viewSrc, /WorkspaceEmptyState/);
  assert.match(viewSrc, /WorkspaceSkeleton/);
  // Ensure zero client-side sum/reduce calculations
  assert.doesNotMatch(viewSrc, /\.reduce\(/);
  assert.doesNotMatch(viewSrc, /todayDeposits/);
  assert.doesNotMatch(viewSrc, /todayWithdrawals/);
});

test("WorkspaceTransactionTable renders semantic desktop table, formatted IDR, and student subtext", () => {
  const tableSrc = source("src/components/transactions/workspace/workspace-transaction-table.tsx");
  assert.match(tableSrc, /<table/);
  assert.match(tableSrc, /<th scope="col"/);
  assert.match(tableSrc, /transactionDate/);
  assert.match(tableSrc, /rupiah/);
  assert.match(tableSrc, /transactionSign/);
  assert.match(tableSrc, /transactionTypeLabel/);
  assert.match(tableSrc, /studentNotes/);
  assert.match(tableSrc, /StatusBadge/);
  assert.match(tableSrc, /tone=/);
});

test("WorkspaceTransactionCards renders responsive mobile cards with touch targets and metadata", () => {
  const cardSrc = source("src/components/transactions/workspace/workspace-transaction-cards.tsx");
  assert.match(cardSrc, /<article/);
  assert.match(cardSrc, /studentNotes/);
  assert.match(cardSrc, /StatusBadge/);
  assert.match(cardSrc, /tone=/);
  assert.match(cardSrc, /rupiah/);
});

test("WorkspaceStates provides distinct empty state and table skeleton", () => {
  const statesSrc = source("src/components/transactions/workspace/workspace-states.tsx");
  assert.match(statesSrc, /EmptyState/);
  assert.match(statesSrc, /Belum Ada Transaksi/);
  assert.match(statesSrc, /LoadingSkeleton/);
  assert.match(statesSrc, /variant="table"/);
});

test("WorkspacePaginationBar renders load-more controls with cursor support", () => {
  const paginationSrc = source("src/components/transactions/workspace/workspace-pagination-bar.tsx");
  assert.match(paginationSrc, /nextCursor/);
  assert.match(paginationSrc, /Muat Lebih Banyak/);
  assert.match(paginationSrc, /onLoadMore/);
});
