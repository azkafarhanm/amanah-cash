"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { StudentFormState, StudentFormValues } from "@/admin-forms/state";
import type { StudentOperatorOption } from "@/students/domain";
import { FormSubmitButton } from "./form-submit-button";

type StudentFormAction = (
  state: StudentFormState,
  formData: FormData
) => Promise<StudentFormState>;

export function StudentForm({
  action,
  initialValues,
  mode,
  operators,
  styles
}: {
  action: StudentFormAction;
  initialValues: StudentFormValues;
  mode: "create" | "edit";
  operators: StudentOperatorOption[];
  styles: Record<string, string>;
}) {
  const initialState: StudentFormState = {
    status: "idle",
    message: null,
    fieldErrors: {},
    values: initialValues
  };
  const [state, formAction] = useActionState(action, initialState);
  const [values, setValues] = useState(initialValues);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? summaryRef.current)?.focus();
  }, [state]);

  const error = (field: keyof StudentFormValues) => state.fieldErrors[field];
  const describedBy = (field: keyof StudentFormValues, hint?: string) =>
    [hint, error(field) ? `student-${mode}-${field}-error` : null].filter(Boolean).join(" ") ||
    undefined;
  const set = (field: keyof StudentFormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  return (
    <form action={formAction} className={`${styles.form} ${styles.panel}`} ref={formRef}>
      {mode === "edit" ? <h2>Edit Siswa</h2> : null}
      {state.status === "error" ? (
        <p className={styles.error} ref={summaryRef} role="alert" tabIndex={-1}>
          {state.message}
        </p>
      ) : null}
      <label className={styles.field}>
        Nama lengkap
        <input
          aria-describedby={describedBy("name")}
          aria-invalid={Boolean(error("name"))}
          className={styles.input}
          maxLength={100}
          name="name"
          onChange={(event) => set("name", event.target.value)}
          required
          value={values.name}
        />
        {error("name") ? (
          <span className={styles.error} id={`student-${mode}-name-error`}>{error("name")}</span>
        ) : null}
      </label>
      <label className={styles.field}>
        Operator
        <select
          aria-describedby={describedBy("operatorId")}
          aria-invalid={Boolean(error("operatorId"))}
          className={styles.select}
          name="operatorId"
          onChange={(event) => set("operatorId", event.target.value)}
          required
          value={values.operatorId}
        >
          {mode === "create" ? <option value="" disabled>Pilih Operator aktif</option> : null}
          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.name} · {operator.email}
            </option>
          ))}
        </select>
        {error("operatorId") ? (
          <span className={styles.error} id={`student-${mode}-operatorId-error`}>
            {error("operatorId")}
          </span>
        ) : null}
      </label>
      {mode === "edit" ? (
        <label className={styles.field}>
          Alasan perpindahan Operator
          <textarea
            aria-describedby={describedBy(
              "ownershipTransferReason",
              `student-${mode}-ownership-transfer-hint`
            )}
            aria-invalid={Boolean(error("ownershipTransferReason"))}
            className={styles.textarea}
            maxLength={500}
            name="ownershipTransferReason"
            onChange={(event) => set("ownershipTransferReason", event.target.value)}
            value={values.ownershipTransferReason}
          />
          <span id={`student-${mode}-ownership-transfer-hint`}>
            Wajib diisi hanya jika Operator diubah. Alasan dicatat dalam audit kepemilikan.
          </span>
          {error("ownershipTransferReason") ? (
            <span
              className={styles.error}
              id={`student-${mode}-ownershipTransferReason-error`}
            >
              {error("ownershipTransferReason")}
            </span>
          ) : null}
        </label>
      ) : null}
      <label className={styles.field}>
        Status
        <select
          aria-describedby={describedBy("status")}
          aria-invalid={Boolean(error("status"))}
          className={styles.select}
          name="status"
          onChange={(event) => set("status", event.target.value)}
          value={values.status}
        >
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Tidak aktif</option>
          <option value="ARCHIVED">Diarsipkan</option>
        </select>
        {error("status") ? (
          <span className={styles.error} id={`student-${mode}-status-error`}>
            {error("status")}
          </span>
        ) : null}
      </label>
      <label className={styles.field}>
        Catatan{mode === "create" ? " (opsional)" : ""}
        <textarea
          aria-describedby={describedBy("notes")}
          aria-invalid={Boolean(error("notes"))}
          className={styles.textarea}
          maxLength={500}
          name="notes"
          onChange={(event) => set("notes", event.target.value)}
          value={values.notes}
        />
        {error("notes") ? (
          <span className={styles.error} id={`student-${mode}-notes-error`}>{error("notes")}</span>
        ) : null}
      </label>
      <div className={styles.actions}>
        {mode === "create" ? (
          <Link className={styles.link} href="/admin/students">Batal</Link>
        ) : null}
        <FormSubmitButton
          className={styles.button}
          disabled={!operators.length}
          idleLabel={mode === "create" ? "Buat Siswa" : "Simpan perubahan"}
          pendingLabel={mode === "create" ? "Membuat Siswa…" : "Menyimpan…"}
        />
      </div>
      {!operators.length ? (
        <p className={styles.error}>Aktifkan setidaknya satu Operator sebelum membuat Siswa.</p>
      ) : null}
    </form>
  );
}
