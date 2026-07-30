"use client";

import type { ComponentProps } from "react";

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
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm("Hapus Operator ini? Tindakan ini akan menonaktifkan akses akun.")) {
          event.preventDefault();
        }
      }}
    >
      <h2>Hapus Operator</h2>
      <p>Hanya dapat dilakukan bila tidak ada Siswa yang ditugaskan. Identitas historis dan audit tetap dipertahankan.</p>
      <button className={buttonClassName} type="submit">Hapus Operator</button>
    </form>
  );
}
