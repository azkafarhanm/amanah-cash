import styles from "./workspace.module.css";

type WorkspacePaginationBarProps = {
  nextCursor: string | null;
  isLoading: boolean;
  onLoadMore: () => void;
  total: number;
  loadedCount: number;
};

export function WorkspacePaginationBar({
  nextCursor,
  isLoading,
  onLoadMore,
  total,
  loadedCount
}: WorkspacePaginationBarProps) {
  if (!nextCursor && loadedCount >= total) {
    return null;
  }

  return (
    <div className={styles.paginationContainer} aria-label="Paginasi Transaksi">
      <span className={styles.studentSubtext}>
        Menampilkan {loadedCount} dari {total} transaksi
      </span>
      {nextCursor ? (
        <button
          type="button"
          className={styles.loadMoreButton}
          onClick={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Muat Lebih Banyak"}
        </button>
      ) : null}
    </div>
  );
}
