"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WorkspaceTransactionItem, WorkspaceTransactionResult, WorkspaceTransactionSummary } from "@/transactions/read-service";
import { Button, ErrorState } from "@/components/ui";
import { WorkspaceMetricsBanner } from "./workspace-metrics-banner";
import { WorkspaceFilterToolbar, type FilterValues } from "./workspace-filter-toolbar";
import { WorkspaceTransactionTable } from "./workspace-transaction-table";
import { WorkspaceTransactionCards } from "./workspace-transaction-cards";
import { WorkspacePaginationBar } from "./workspace-pagination-bar";
import { WorkspaceEmptyState, WorkspaceSkeleton } from "./workspace-states";
import styles from "./workspace.module.css";

function TransactionWorkspaceController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentType = searchParams.get("type") || "";
  const currentPeriod = searchParams.get("period") || "TODAY";

  const [items, setItems] = useState<WorkspaceTransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [summary, setSummary] = useState<WorkspaceTransactionSummary>({
    todayDeposits: "0",
    todayWithdrawals: "0",
    todayTransactionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspace = useCallback((search: string, type: string, period: string) => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (period) params.set("period", period);

    fetch(`/api/operator/transactions?${params.toString()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat transaksi (${res.status})`);
        return res.json();
      })
      .then((data: WorkspaceTransactionResult) => {
        setItems(data.items);
        setTotal(data.total);
        setNextCursor(data.nextCursor);
        if (data.summary) {
          setSummary(data.summary);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (currentType) params.set("type", currentType);
    if (currentPeriod) params.set("period", currentPeriod);

    fetch(`/api/operator/transactions?${params.toString()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat transaksi (${res.status})`);
        return res.json();
      })
      .then((data: WorkspaceTransactionResult) => {
        if (!cancelled) {
          setItems(data.items);
          setTotal(data.total);
          setNextCursor(data.nextCursor);
          if (data.summary) {
            setSummary(data.summary);
          }
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentSearch, currentType, currentPeriod]);


  const handleFilterChange = useCallback((updated: Partial<FilterValues>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updated.search !== undefined) {
      if (updated.search.trim()) params.set("search", updated.search.trim());
      else params.delete("search");
    }

    if (updated.type !== undefined) {
      if (updated.type) params.set("type", updated.type);
      else params.delete("type");
    }

    if (updated.period !== undefined) {
      if (updated.period && updated.period !== "TODAY") params.set("period", updated.period);
      else params.delete("period");
    }

    params.delete("cursor");

    const queryStr = params.toString();
    const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  async function handleLoadMore() {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentType) params.set("type", currentType);
      if (currentPeriod) params.set("period", currentPeriod);
      params.set("cursor", nextCursor);

      const response = await fetch(`/api/operator/transactions?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Gagal memuat transaksi berikutnya (${response.status})`);
      }
      const data: WorkspaceTransactionResult = await response.json();
      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setNextCursor(data.nextCursor);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat transaksi berikutnya.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  const filters: FilterValues = {
    search: currentSearch,
    type: currentType,
    period: currentPeriod
  };

  return (
    <div className={styles.workspaceContainer}>
      <WorkspaceMetricsBanner summary={summary} />
      <WorkspaceFilterToolbar filters={filters} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <WorkspaceSkeleton />
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Workspace"
          description={error}
          action={
            <Button type="button" onClick={() => fetchWorkspace(currentSearch, currentType, currentPeriod)}>
              Coba Lagi
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <WorkspaceEmptyState />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export function TransactionWorkspaceView() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <TransactionWorkspaceController />
    </Suspense>
  );
}
