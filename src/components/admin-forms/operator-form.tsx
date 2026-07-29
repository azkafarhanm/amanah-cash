"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { OperatorFormState, OperatorFormValues } from "@/admin-forms/state";
import { FormSubmitButton } from "./form-submit-button";

type OperatorFormAction = (
  state: OperatorFormState,
  formData: FormData
) => Promise<OperatorFormState>;

export function OperatorForm({
  action,
  initialValues,
  mode,
  styles
}: {
  action: OperatorFormAction;
  initialValues: OperatorFormValues;
  mode: "create" | "edit";
  styles: Record<string, string>;
}) {
  const initialState: OperatorFormState = {
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

  const error = (field: keyof OperatorFormValues) => state.fieldErrors[field];
  const describedBy = (field: keyof OperatorFormValues) =>
    error(field) ? `operator-${mode}-${field}-error` : undefined;

  return (
    <form action={formAction} className={`${styles.form} ${styles.panel}`} ref={formRef}>
      {mode === "edit" ? <h2>Edit Operator</h2> : null}
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
          autoComplete="name"
          className={styles.input}
          maxLength={100}
          minLength={2}
          name="name"
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          required
          value={values.name}
        />
        {error("name") ? (
          <span className={styles.error} id={describedBy("name")}>{error("name")}</span>
        ) : null}
      </label>
      {mode === "create" ? (
        <label className={styles.field}>
          Email Google
          <input
            aria-describedby={describedBy("email")}
            aria-invalid={Boolean(error("email"))}
            autoComplete="email"
            className={styles.input}
            maxLength={254}
            name="email"
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            value={values.email}
          />
          {error("email") ? (
            <span className={styles.error} id={describedBy("email")}>{error("email")}</span>
          ) : null}
        </label>
      ) : (
        <label className={styles.field}>
          <span>Status aktif</span>
          <span>
            <input
              aria-describedby={describedBy("isActive")}
              aria-invalid={Boolean(error("isActive"))}
              checked={values.isActive}
              name="isActive"
              onChange={(event) =>
                setValues((current) => ({ ...current, isActive: event.target.checked }))
              }
              type="checkbox"
            />{" "}
            Operator dapat masuk setelah akun Google diprovisikan.
          </span>
          {error("isActive") ? (
            <span className={styles.error} id={describedBy("isActive")}>
              {error("isActive")}
            </span>
          ) : null}
        </label>
      )}
      <div className={styles.actions}>
        {mode === "create" ? (
          <Link className={styles.link} href="/admin/operators">Batal</Link>
        ) : null}
        <FormSubmitButton
          className={styles.button}
          idleLabel={mode === "create" ? "Buat Operator" : "Simpan perubahan"}
          pendingLabel={mode === "create" ? "Membuat Operator…" : "Menyimpan…"}
        />
      </div>
    </form>
  );
}
