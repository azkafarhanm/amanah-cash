"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({
  className,
  idleLabel,
  pendingLabel,
  disabled = false
}: {
  className: string;
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={disabled || pending}
      className={className}
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
