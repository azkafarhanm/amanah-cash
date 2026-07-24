"use client";

import { useEffect, useState } from "react";
import styles from "./workspace.module.css";

export type FilterValues = {
  search: string;
  type: string;
  period: string;
};

type WorkspaceFilterToolbarProps = {
  filters: FilterValues;
  onFilterChange: (updated: Partial<FilterValues>) => void;
};

const TYPE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "DEPOSIT", label: "Setoran" },
  { value: "WITHDRAWAL", label: "Penarikan" },
  { value: "CORRECTION", label: "Koreksi" }
] as const;

const PERIOD_OPTIONS = [
  { value: "TODAY", label: "Hari Ini" },
  { value: "WEEK", label: "7 Hari Terakhir" },
  { value: "MONTH", label: "Bulan Ini" },
  { value: "ALL", label: "Semua" }
] as const;

export function WorkspaceFilterToolbar({ filters, onFilterChange }: WorkspaceFilterToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [prevSearch, setPrevSearch] = useState(filters.search);

  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search);
  }

  // Debounce search input changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);


  return (
    <section className={styles.filterToolbar} aria-label="Filter dan Pencarian Workspace">
      <div className={styles.filterGroup}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Cari nama siswa, catatan, atau alasan..."
          aria-label="Cari transaksi"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className={styles.filterControls}>
        <div className={styles.typeSegmentedGroup} role="group" aria-label="Filter Jenis Transaksi">
          {TYPE_OPTIONS.map((option) => {
            const isActive = (filters.type || "") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={[styles.pillButton, isActive ? styles.pillButtonActive : ""].filter(Boolean).join(" ")}
                aria-pressed={isActive}
                onClick={() => onFilterChange({ type: option.value })}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className={styles.periodSelectGroup}>
          <label htmlFor="workspace-period-select" className="sr-only">
            Filter Periode Waktu
          </label>
          <select
            id="workspace-period-select"
            className={styles.periodSelect}
            aria-label="Filter Periode Waktu"
            value={filters.period || "TODAY"}
            onChange={(e) => onFilterChange({ period: e.target.value })}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
