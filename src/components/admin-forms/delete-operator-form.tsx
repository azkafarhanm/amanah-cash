"use client";

import { useRef, useState, type ComponentProps, type FormEvent } from "react";
import { ConfirmationDialog } from "@/components/ui";

type Props = {
  action: ComponentProps<"form">["action"];
  className: string;
  buttonClassName: string;
};

export function DeleteOperatorForm({
  action,
  className,
  buttonClassName
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (confirmed.current) {
      confirmed.current = false;
      return;
    }
    event.preventDefault();
    setConfirmOpen(true);
  }

  function confirmDelete() {
    confirmed.current = true;
    setConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action={action}
        className={className}
        onSubmit={submit}
      >
        <h2>Hapus Operator</h2>
        <p>Hanya dapat dilakukan bila tidak ada Siswa yang ditugaskan. Identitas historis dan audit tetap dipertahankan.</p>
        <button className={buttonClassName} type="submit">Hapus Operator</button>
      </form>
      <ConfirmationDialog
        open={confirmOpen}
        title="Hapus Operator?"
        description="Akses Operator akan dinonaktifkan. Identitas historis dan audit tetap dipertahankan, dan tindakan ini tidak dapat dibatalkan dari halaman ini."
        confirmLabel="Hapus Operator"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
