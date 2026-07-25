"use client";

import { useEffect, useRef, useState, useId, type KeyboardEvent } from "react";
import { rupiah } from "../presentation";
import styles from "./workspace.module.css";

export type StudentOption = {
  id: string;
  name: string;
  notes: string | null;
  balance?: string;
};

export function WorkspaceStudentPicker({
  value,
  onSelect,
  autoFocus = false,
  disabled = false,
  placeholder = "Cari atau pilih Siswa…"
}: {
  value?: string;
  onSelect(student: StudentOption | null): void;
  autoFocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [prevValue, setPrevValue] = useState(value);

  // Sync search input when prop value changes
  if (value !== prevValue) {
    setPrevValue(value);
    const selected = students.find((s) => s.id === value);
    if (selected) {
      setSearch(selected.name);
    } else if (!value) {
      setSearch("");
    }
  }

  // Fetch operator students on mount
  useEffect(() => {
    let active = true;
    fetch("/api/operator/students", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { items: StudentOption[] }) => {
        if (active && Array.isArray(data.items)) {
          setStudents(data.items);
          if (value) {
            const found = data.items.find((s) => s.id === value);
            if (found) setSearch(found.name);
          }
        }
      })
      .catch(() => {
        if (active) setStudents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [value]);

  const selectedStudent = students.find((s) => s.id === value);

  // Handle focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter students based on search query
  const filtered = students.filter((student) => {
    if (!search.trim()) return true;
    if (selectedStudent && search.trim() === selectedStudent.name) return true;
    const query = search.toLowerCase().trim();
    return (
      student.name.toLowerCase().includes(query) ||
      (student.notes && student.notes.toLowerCase().includes(query))
    );
  });

  function handleInputChange(text: string) {
    setSearch(text);
    setIsOpen(true);
    setActiveIndex(0);
    if (selectedStudent && text !== selectedStudent.name) {
      onSelect(null);
    }
  }

  function handleSelectStudent(student: StudentOption) {
    onSelect(student);
    setSearch(student.name);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      }
    } else if (e.key === "Enter") {
      if (isOpen && activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        handleSelectStudent(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (selectedStudent) {
        setSearch(selectedStudent.name);
      }
    }
  }

  return (
    <div ref={containerRef} className={styles.pickerContainer}>
      <div className={styles.pickerInputWrapper}>
        <input
          ref={inputRef}
          className={styles.pickerInput}
          type="text"
          value={search}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            if (filtered.length > 0 && activeIndex < 0) setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
        {selectedStudent && !disabled && (
          <button
            type="button"
            className={styles.pickerClearButton}
            onClick={() => {
              onSelect(null);
              setSearch("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            aria-label="Bersihkan pilihan Siswa"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          id={listboxId}
          className={styles.pickerDropdown}
          role="listbox"
          aria-label="Daftar Siswa"
        >
          {loading ? (
            <li className={styles.pickerMessage}>Memuat Siswa…</li>
          ) : filtered.length === 0 ? (
            <li className={styles.pickerMessage}>Tidak ada Siswa ditemukan</li>
          ) : (
            filtered.map((student, idx) => {
              const isSelected = student.id === value;
              const isActive = idx === activeIndex;
              return (
                <li
                  key={student.id}
                  id={`${listboxId}-option-${idx}`}
                  className={`${styles.pickerOption} ${isSelected ? styles.pickerOptionSelected : ""} ${
                    isActive ? styles.pickerOptionActive : ""
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectStudent(student)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className={styles.pickerPrimary}>
                    <span className={styles.studentName}>{student.name}</span>
                    <span className={styles.studentBalance}>
                      Saldo {rupiah(student.balance ?? "0")}
                    </span>
                  </div>
                  <div className={styles.pickerSecondary}>
                    {student.notes ? student.notes : "Tanpa catatan"}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
