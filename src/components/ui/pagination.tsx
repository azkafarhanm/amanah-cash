import Link from "next/link";
import styles from "./ui.module.css";

export type PaginationProps = {
  ariaLabel: string;
  page: number;
  pages: number;
  totalLabel: string;
  previousHref?: string;
  nextHref?: string;
  scroll?: boolean;
};

export function Pagination({
  ariaLabel,
  page,
  pages,
  totalLabel,
  previousHref,
  nextHref,
  scroll
}: PaginationProps) {
  if (pages <= 1) {
    return <p className={styles.paginationSummary}>1 halaman · {totalLabel}</p>;
  }

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      <span className={styles.paginationSummary}>
        <strong aria-current="page">Halaman {page}</strong> dari {pages} · {totalLabel}
      </span>
      <div className={styles.paginationControls}>
        {previousHref ? (
          <Link href={previousHref} scroll={scroll}>Sebelumnya</Link>
        ) : (
          <span className={styles.paginationDisabled} aria-disabled="true">Sebelumnya</span>
        )}
        {nextHref ? (
          <Link href={nextHref} scroll={scroll}>Berikutnya</Link>
        ) : (
          <span className={styles.paginationDisabled} aria-disabled="true">Berikutnya</span>
        )}
      </div>
    </nav>
  );
}
