"use client";

import { useEffect, useState } from "react";
import type { WorkspaceTransactionItem, WorkspaceTransactionResult } from "@/transactions/read-service";
import { Button, ErrorState } from "@/components/ui";
import { WorkspaceTransactionTable } from "./workspace-transaction-table";

import { WorkspaceTransactionCards } from "./workspace-transaction-cards";
import { WorkspacePaginationBar } from "./workspace-pagination-bar";
import { WorkspaceEmptyState, WorkspaceSkeleton } from "./workspace-states";
import styles from "./workspace.module.css";

export function TransactionWorkspaceView() {
  const [items, setItems] = useState<WorkspaceTransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/operator/transactions", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Gagal memuat transaksi (${response.status})`);
        }
        const data: WorkspaceTransactionResult = await response.json();
        if (!cancelled) {
          setItems(data.items);
          setTotal(data.total);
          setNextCursor(data.nextCursor);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLoadMore() {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/operator/transactions?cursor=${encodeURIComponent(nextCursor)}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Gagal memuat transaksi berikutnya (${response.status})`);
      }
      const data: WorkspaceTransactionResult = await response.json();
      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat transaksi berikutnya.");
    } finally {
      setIsLoadingMore(false);
    }
  }


  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal Memuat Workspace"
        description={error}
        action={
          <Button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetch("/api/operator/transactions", { cache: "no-store" })
                .then((res) => res.json())
                .then((data: WorkspaceTransactionResult) => {
                  setItems(data.items);
                  setTotal(data.total);
                  setNextCursor(data.nextCursor);
                })
                .catch((err) => setError(err.message))
                .finally(() => setIsLoading(false));
            }}
          >
            Coba Lagi
          </Button>
        }
      />
    );
  }

  if (items.length === 0) {
    return <WorkspaceEmptyState />;
  }

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.desktopView}>
        <WorkspaceTransactionTable items={items} />
      </div>
      <div className={styles.mobileView}>
        <WorkspaceTransactionCards items={items} />
      </div>
      <WorkspacePaginationBar
        nextCursor={nextCursor}
        isLoading={isLoadingMore}
        onLoadMore={handleLoadMore}
        total={total}
        loadedCount={items.length}
      />
    </div>
  );
}
