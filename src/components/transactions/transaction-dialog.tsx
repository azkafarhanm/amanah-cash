"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui";
import type { TransactionHistoryItem } from "@/transactions/read-service";
import { rupiah } from "./presentation";
import styles from "./transactions.module.css";

type DialogKind = "DEPOSIT" | "WITHDRAWAL" | "CORRECTION" | "EDIT" | "DELETE" | "RESTORE";

function localDateTime(value = new Date()) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function TransactionDialog({ kind, studentId, balance, item, disabled = false, onSuccess }: {
  kind: DialogKind; studentId: string; balance: string; item?: TransactionHistoryItem; disabled?: boolean;
  onSuccess(message: string): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const commandId = useRef(crypto.randomUUID());
  const transactionId = useRef(crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState(item?.type ?? (kind === "EDIT" ? "DEPOSIT" : kind));
  const title = kind === "DEPOSIT" ? "Setor dana" : kind === "WITHDRAWAL" ? "Tarik dana" : kind === "CORRECTION" ? "Buat koreksi" : kind === "EDIT" ? "Edit transaksi" : kind === "DELETE" ? "Hapus transaksi" : "Pulihkan transaksi";
  const trigger = kind === "DEPOSIT" ? "Setor" : kind === "WITHDRAWAL" ? "Tarik" : kind === "CORRECTION" ? "Koreksi" : kind === "EDIT" ? "Edit" : kind === "DELETE" ? "Hapus" : "Pulihkan";

  useEffect(() => {
    if (error) errorSummary.current?.focus();
  }, [error]);

  function open() {
    setError("");
    setSelectedType(item?.type ?? (kind === "EDIT" ? "DEPOSIT" : kind));
    dialog.current?.showModal();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    let url = `/api/operator/students/${encodeURIComponent(studentId)}/transactions`;
    let method = "POST";
    let body: Record<string, unknown>;
    if (kind === "DELETE" || kind === "RESTORE") {
      if (!item) return;
      url += `/${encodeURIComponent(item.id)}${kind === "RESTORE" ? "/restore" : ""}`;
      method = kind === "DELETE" ? "DELETE" : "POST";
      body = { commandId: commandId.current, expectedRevision: item.revision, reason: data.get("lifecycleReason") };
    } else {
      const type = kind === "EDIT" ? String(data.get("type")) : kind;
      const amount = String(data.get("amount") ?? "").trim();
      if (!/^[0-9]+$/.test(amount) || BigInt(amount) <= BigInt(0)) {
        setError("Jumlah harus berupa Rupiah bulat dan lebih dari nol.");
        const amountField = form.elements.namedItem("amount");
        if (amountField instanceof HTMLElement) amountField.focus();
        return;
      }
      if (kind === "WITHDRAWAL" && BigInt(amount) > BigInt(balance)) {
        setError("Saldo tidak mencukupi. Server akan tetap memvalidasi saldo saat penyimpanan.");
        return;
      }
      const occurredAtValue = String(data.get("occurredAt"));
      const occurredAt = new Date(occurredAtValue);
      if (Number.isNaN(occurredAt.getTime())) { setError("Waktu transaksi tidak valid."); return; }
      body = {
        commandId: commandId.current,
        type,
        amount,
        notes: data.get("notes"),
        occurredAt: occurredAt.toISOString(),
        ...(type === "CORRECTION" ? { correctionDirection: data.get("correctionDirection"), reason: data.get("reason") } : {})
      };
      if (kind === "EDIT" && item) {
        url += `/${encodeURIComponent(item.id)}`;
        method = "PATCH";
        body.expectedRevision = item.revision;
        body.editReason = data.get("editReason");
      } else body.transactionId = transactionId.current;
    }
    setPending(true);
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) { setError(payload.error?.message ?? "Transaksi tidak dapat disimpan."); return; }
      dialog.current?.close();
      commandId.current = crypto.randomUUID();
      if (!item) transactionId.current = crypto.randomUUID();
      onSuccess(`${title} berhasil disimpan.`);
    } catch {
      setError("Hasil transaksi belum dapat dipastikan. Periksa koneksi lalu coba lagi; identitas perintah yang sama akan digunakan.");
    } finally {
      setPending(false);
    }
  }

  const destructive = kind === "DELETE";
  const isLifecycle = kind === "DELETE" || kind === "RESTORE";
  const triggerClass = destructive ? styles.dangerButton : kind === "DEPOSIT" ? styles.depositButton : kind === "WITHDRAWAL" ? styles.withdrawalButton : kind === "CORRECTION" ? styles.correctionButton : undefined;
  return <>
    <Button variant={kind === "DEPOSIT" || kind === "WITHDRAWAL" ? "primary" : "secondary"} className={triggerClass} disabled={disabled} onClick={open} aria-haspopup="dialog">{trigger}</Button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${kind}-${item?.id ?? "new"}-title`}>
      <form className={styles.dialogForm} onSubmit={submit}>
        <header className={styles.dialogHeader}><div><h2 id={`${kind}-${item?.id ?? "new"}-title`}>{title}</h2><p>{kind === "DEPOSIT" ? "Saldo akan bertambah." : kind === "WITHDRAWAL" ? `Saldo tersedia ${rupiah(balance)}.` : kind === "CORRECTION" ? "Gunakan hanya untuk menyesuaikan selisih ledger." : isLifecycle ? "Tindakan ini dicatat dalam audit dan tidak menghapus riwayat permanen." : "Perubahan efek akan diterapkan ke saldo secara atomik."}</p></div><button className={styles.closeButton} type="button" onClick={() => dialog.current?.close()} aria-label={`Tutup ${title}`}>×</button></header>
        {error ? <p ref={errorSummary} className={styles.error} role="alert" tabIndex={-1}>{error}</p> : null}
        {isLifecycle ? <>
          <p className={styles.confirmation}>{kind === "DELETE" ? "Transaksi akan dinonaktifkan dan efeknya dikeluarkan dari saldo." : "Efek transaksi akan diterapkan kembali ke saldo."}</p>
          <label className={styles.field}>Alasan {kind === "DELETE" ? "penghapusan" : "pemulihan"}<textarea className={styles.textarea} name="lifecycleReason" required maxLength={500} autoFocus /></label>
        </> : <>
          {kind === "EDIT" ? <label className={styles.field}>Jenis transaksi<select className={styles.select} name="type" value={selectedType} onChange={(event) => setSelectedType(event.target.value as typeof selectedType)}><option value="DEPOSIT">Setoran</option><option value="WITHDRAWAL">Penarikan</option><option value="CORRECTION">Koreksi</option></select></label> : null}
          <label className={styles.field}>Jumlah Rupiah<input className={styles.input} name="amount" type="text" inputMode="numeric" pattern="[0-9]+" defaultValue={item?.amount} required autoFocus aria-describedby={`${kind}-amount-hint`} /><span id={`${kind}-amount-hint`} className={styles.hint}>Masukkan Rupiah utuh tanpa titik atau koma.</span></label>
          <label className={styles.field}>Waktu transaksi<input className={styles.input} name="occurredAt" type="datetime-local" defaultValue={item ? localDateTime(new Date(item.occurredAt)) : localDateTime()} required /></label>
          <label className={styles.field}>Catatan<textarea className={styles.textarea} name="notes" defaultValue={item?.notes ?? ""} required={kind === "DEPOSIT" || (kind === "EDIT" && selectedType === "DEPOSIT")} maxLength={500} /></label>
          {(kind === "CORRECTION" || (kind === "EDIT" && selectedType === "CORRECTION")) ? <div className={styles.correctionFields}><label className={styles.field}>Arah koreksi<select className={styles.select} name="correctionDirection" defaultValue={item?.correctionDirection ?? "INCREASE"}><option value="INCREASE">Tambah saldo</option><option value="DECREASE">Kurangi saldo</option></select></label><label className={styles.field}>Alasan koreksi<textarea className={styles.textarea} name="reason" defaultValue={item?.reason ?? ""} required maxLength={500} /></label></div> : null}
          {kind === "EDIT" ? <label className={styles.field}>Alasan edit<textarea className={styles.textarea} name="editReason" required maxLength={500} /></label> : null}
        </>}
        <footer className={styles.dialogActions}><Button type="button" variant="secondary" disabled={pending} onClick={() => dialog.current?.close()}>Batal</Button><Button type="submit" isLoading={pending} loadingLabel="Menyimpan transaksi">{pending ? "Menyimpan…" : kind === "DELETE" ? "Hapus sementara" : kind === "RESTORE" ? "Pulihkan transaksi" : "Simpan transaksi"}</Button></footer>
      </form>
    </dialog>
  </>;
}
