"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui";
import type { TransactionHistoryItem } from "@/transactions/read-service";
import { WorkspaceStudentPicker, type StudentOption } from "./workspace/workspace-student-picker";
import { formatThousand, parseNumericValue, rupiah } from "./presentation";
import styles from "./transactions.module.css";

export type DialogKind = "DEPOSIT" | "WITHDRAWAL" | "CORRECTION" | "EDIT" | "DELETE" | "RESTORE" | "NEW";

function localDateTime(value = new Date()) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function TransactionDialog({
  kind,
  studentId: initialStudentId,
  balance: initialBalance,
  item,
  disabled = false,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  hideTrigger = false,
  allowStudentPicker = false,
  triggerText,
  triggerVariant,
  triggerClassName,
  onSuccess
}: {
  kind: DialogKind;
  studentId?: string;
  balance?: string;
  item?: TransactionHistoryItem;
  disabled?: boolean;
  isOpen?: boolean;
  onClose?(): void;
  hideTrigger?: boolean;
  allowStudentPicker?: boolean;
  triggerText?: string;
  triggerVariant?: "primary" | "secondary";
  triggerClassName?: string;
  onSuccess(message: string): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const commandId = useRef(crypto.randomUUID());
  const transactionId = useRef(crypto.randomUUID());

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [pickerAutoFocus, setPickerAutoFocus] = useState(false);

  // Type memory for consecutive entries
  const [selectedType, setSelectedType] = useState<"DEPOSIT" | "WITHDRAWAL" | "CORRECTION">(
    kind === "EDIT"
      ? (item?.type ?? "DEPOSIT")
      : kind === "NEW"
      ? "DEPOSIT"
      : kind === "DELETE" || kind === "RESTORE"
      ? "DEPOSIT"
      : kind
  );
  const [correctionDirection, setCorrectionDirection] = useState<"INCREASE" | "DECREASE">(
    item?.correctionDirection ?? "INCREASE"
  );

  const isPickerRequired = allowStudentPicker || !initialStudentId;
  const activeStudentId = initialStudentId || selectedStudent?.id || "";
  const activeBalance = initialBalance ?? selectedStudent?.balance ?? "0";

  const effectiveKind = kind === "NEW" ? selectedType : kind;

  const title =
    effectiveKind === "DEPOSIT"
      ? "Setor dana"
      : effectiveKind === "WITHDRAWAL"
      ? "Tarik dana"
      : effectiveKind === "CORRECTION"
      ? "Buat koreksi"
      : effectiveKind === "EDIT"
      ? "Edit transaksi"
      : effectiveKind === "DELETE"
      ? "Hapus transaksi"
      : "Pulihkan transaksi";

  const trigger =
    triggerText ??
    (kind === "DEPOSIT"
      ? "Setor"
      : kind === "WITHDRAWAL"
      ? "Tarik"
      : kind === "CORRECTION"
      ? "Koreksi"
      : kind === "EDIT"
      ? "Edit"
      : kind === "DELETE"
      ? "Hapus"
      : kind === "RESTORE"
      ? "Pulihkan"
      : "Catat transaksi");

  // Sync open state for controlled usage
  useEffect(() => {
    if (controlledIsOpen !== undefined && dialog.current) {
      if (controlledIsOpen && !dialog.current.open) {
        setError("");
        dialog.current.showModal();
      } else if (!controlledIsOpen && dialog.current.open) {
        dialog.current.close();
      }
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    if (error) errorSummary.current?.focus();
  }, [error]);

  function open() {
    setError("");
    setSelectedType(
      kind === "EDIT"
        ? (item?.type ?? "DEPOSIT")
        : kind === "NEW"
        ? "DEPOSIT"
        : kind === "DELETE" || kind === "RESTORE"
        ? "DEPOSIT"
        : kind
    );
    if (item?.correctionDirection) {
      setCorrectionDirection(item.correctionDirection);
    }
    dialog.current?.showModal();
  }

  function closeDialog() {
    dialog.current?.close();
    if (controlledOnClose) controlledOnClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const isConsecutive = submitter?.getAttribute("data-action") === "save-and-next";

    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");

    if (!activeStudentId) {
      setError("Pilih Siswa terlebih dahulu.");
      return;
    }

    let url = `/api/operator/students/${encodeURIComponent(activeStudentId)}/transactions`;
    let method = "POST";
    let body: Record<string, unknown>;

    if (kind === "DELETE" || kind === "RESTORE") {
      if (!item) return;
      url += `/${encodeURIComponent(item.id)}${kind === "RESTORE" ? "/restore" : ""}`;
      method = kind === "DELETE" ? "DELETE" : "POST";
      body = {
        commandId: commandId.current,
        expectedRevision: item.revision,
        reason: data.get("lifecycleReason")
      };
    } else {
      const type = kind === "EDIT" || kind === "NEW" ? selectedType : kind;
      const amount = parseNumericValue(data.get("amount"));
      if (!amount || !/^[0-9]+$/.test(amount) || BigInt(amount) <= BigInt(0)) {
        setError("Jumlah harus berupa Rupiah bulat dan lebih dari nol.");
        const amountField = form.elements.namedItem("amount");
        if (amountField instanceof HTMLElement) amountField.focus();
        return;
      }
      if (type === "WITHDRAWAL" && BigInt(amount) > BigInt(activeBalance)) {
        setError("Saldo tidak mencukupi. Server akan tetap memvalidasi saldo saat penyimpanan.");
        return;
      }
      const occurredAtValue = String(data.get("occurredAt"));
      const occurredAt = new Date(occurredAtValue);
      if (Number.isNaN(occurredAt.getTime())) {
        setError("Waktu transaksi tidak valid.");
        return;
      }
      body = {
        commandId: commandId.current,
        type,
        amount,
        notes: data.get("notes"),
        occurredAt: occurredAt.toISOString(),
        ...(type === "CORRECTION"
          ? {
              correctionDirection: data.get("correctionDirection") || correctionDirection,
              reason: data.get("reason")
            }
          : {})
      };

      if (kind === "EDIT" && item) {
        url += `/${encodeURIComponent(item.id)}`;
        method = "PATCH";
        body.expectedRevision = item.revision;
        body.editReason = data.get("editReason");
      } else {
        body.transactionId = transactionId.current;
      }
    }

    setPending(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        setError(payload.error?.message ?? "Transaksi tidak dapat disimpan.");
        return;
      }

      commandId.current = crypto.randomUUID();
      if (!item) transactionId.current = crypto.randomUUID();

      const successNotice = `${title} berhasil disimpan.`;

      if (isConsecutive && (kind === "NEW" || kind === "DEPOSIT" || kind === "WITHDRAWAL" || kind === "CORRECTION")) {
        // Consecutive mode: reset form inputs & student, preserve type & correctionDirection, auto-focus student picker
        form.reset();
        setSelectedStudent(null);
        setPickerAutoFocus(true);
        setError("");
        onSuccess(successNotice);
      } else {
        closeDialog();
        onSuccess(successNotice);
      }
    } catch {
      setError(
        "Hasil transaksi belum dapat dipastikan. Periksa koneksi lalu coba lagi; identitas perintah yang sama akan digunakan."
      );
    } finally {
      setPending(false);
    }
  }

  const destructive = kind === "DELETE";
  const isLifecycle = kind === "DELETE" || kind === "RESTORE";
  const isCreation = kind === "NEW" || kind === "DEPOSIT" || kind === "WITHDRAWAL" || kind === "CORRECTION";

  const triggerClass =
    triggerClassName ??
    (destructive
      ? styles.dangerButton
      : kind === "DEPOSIT"
      ? styles.depositButton
      : kind === "WITHDRAWAL"
      ? styles.withdrawalButton
      : kind === "CORRECTION"
      ? styles.correctionButton
      : undefined);

  return (
    <>
      {!hideTrigger && (
        <Button
          variant={triggerVariant ?? (kind === "DEPOSIT" || kind === "WITHDRAWAL" ? "primary" : "secondary")}
          className={triggerClass}
          disabled={disabled}
          onClick={open}
          aria-haspopup="dialog"
        >
          {trigger}
        </Button>
      )}

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={`${kind}-${item?.id ?? "new"}-title`}
        onClose={() => {
          if (controlledOnClose) controlledOnClose();
        }}
      >
        <form className={styles.dialogForm} onSubmit={submit}>
          <header className={styles.dialogHeader}>
            <div>
              <h2 id={`${kind}-${item?.id ?? "new"}-title`}>{title}</h2>
              <p>
                {effectiveKind === "DEPOSIT"
                  ? `Saldo akan bertambah.${activeStudentId ? ` Saldo saat ini ${rupiah(activeBalance)}.` : ""}`
                  : effectiveKind === "WITHDRAWAL"
                  ? `Saldo tersedia ${rupiah(activeBalance)}.`
                  : effectiveKind === "CORRECTION"
                  ? "Gunakan hanya untuk menyesuaikan selisih ledger."
                  : isLifecycle
                  ? "Tindakan ini dicatat dalam audit dan tidak menghapus riwayat permanen."
                  : "Perubahan efek akan diterapkan ke saldo secara atomik."}
              </p>
            </div>
            <button
              className={styles.closeButton}
              type="button"
              onClick={closeDialog}
              aria-label={`Tutup ${title}`}
            >
              ×
            </button>
          </header>

          {error ? (
            <p ref={errorSummary} className={styles.error} role="alert" tabIndex={-1}>
              {error}
            </p>
          ) : null}

          {isPickerRequired && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Pilih Siswa</label>
              <WorkspaceStudentPicker
                value={selectedStudent?.id}
                onSelect={(student) => setSelectedStudent(student)}
                autoFocus={pickerAutoFocus}
                disabled={pending}
              />
            </div>
          )}

          {isLifecycle ? (
            <>
              <p className={styles.confirmation}>
                {kind === "DELETE"
                  ? "Transaksi akan dinonaktifkan dan efeknya dikeluarkan dari saldo."
                  : "Efek transaksi akan diterapkan kembali ke saldo."}
              </p>
              <label className={styles.field}>
                Alasan {kind === "DELETE" ? "penghapusan" : "pemulihan"}
                <textarea className={styles.textarea} name="lifecycleReason" required maxLength={500} autoFocus />
              </label>
            </>
          ) : (
            <>
              {kind === "EDIT" || kind === "NEW" ? (
                <label className={styles.field}>
                  Jenis transaksi
                  <select
                    className={styles.select}
                    name="type"
                    value={selectedType}
                    onChange={(event) =>
                      setSelectedType(event.target.value as typeof selectedType)
                    }
                  >
                    <option value="DEPOSIT">Setoran</option>
                    <option value="WITHDRAWAL">Penarikan</option>
                    <option value="CORRECTION">Koreksi</option>
                  </select>
                </label>
              ) : null}

              <label className={styles.field}>
                Jumlah Rupiah
                <input
                  ref={amountInputRef}
                  className={styles.input}
                  name="amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  defaultValue={item?.amount ? formatThousand(item.amount) : ""}
                  onChange={(event) => {
                    const digits = parseNumericValue(event.target.value);
                    event.target.value = digits ? formatThousand(digits) : "";
                  }}
                  required
                  autoFocus={!isPickerRequired}
                  aria-describedby={`${kind}-amount-hint`}
                />
                <span id={`${kind}-amount-hint`} className={styles.hint}>
                  Nominal otomatis terformat dengan pemisah ribuan (misal: 10.000).
                </span>
              </label>

              <label className={styles.field}>
                Waktu transaksi
                <input
                  className={styles.input}
                  name="occurredAt"
                  type="datetime-local"
                  defaultValue={item ? localDateTime(new Date(item.occurredAt)) : localDateTime()}
                  required
                />
              </label>

              <label className={styles.field}>
                Catatan
                <textarea
                  className={styles.textarea}
                  name="notes"
                  defaultValue={item?.notes ?? ""}
                  required={
                    effectiveKind === "DEPOSIT" ||
                    (kind === "EDIT" && selectedType === "DEPOSIT")
                  }
                  maxLength={500}
                />
              </label>

              {effectiveKind === "CORRECTION" ? (
                <div className={styles.correctionFields}>
                  <label className={styles.field}>
                    Arah koreksi
                    <select
                      className={styles.select}
                      name="correctionDirection"
                      value={correctionDirection}
                      onChange={(e) =>
                        setCorrectionDirection(e.target.value as "INCREASE" | "DECREASE")
                      }
                    >
                      <option value="INCREASE">Tambah saldo</option>
                      <option value="DECREASE">Kurangi saldo</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    Alasan koreksi
                    <textarea
                      className={styles.textarea}
                      name="reason"
                      defaultValue={item?.reason ?? ""}
                      required
                      maxLength={500}
                    />
                  </label>
                </div>
              ) : null}

              {kind === "EDIT" ? (
                <label className={styles.field}>
                  Alasan edit
                  <textarea className={styles.textarea} name="editReason" required maxLength={500} />
                </label>
              ) : null}
            </>
          )}

          <footer className={styles.dialogActions}>
            <Button type="button" variant="secondary" disabled={pending} onClick={closeDialog}>
              Batal
            </Button>
            {isCreation && (
              <Button
                type="submit"
                variant="secondary"
                data-action="save-and-next"
                isLoading={pending}
                loadingLabel="Menyimpan..."
              >
                Simpan & Catat Lagi
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              data-action="save-and-close"
              isLoading={pending}
              loadingLabel="Menyimpan transaksi"
            >
              {pending
                ? "Menyimpan…"
                : isCreation
                ? "Simpan & Selesai"
                : kind === "DELETE"
                ? "Hapus sementara"
                : kind === "RESTORE"
                ? "Pulihkan transaksi"
                : "Simpan transaksi"}
            </Button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
