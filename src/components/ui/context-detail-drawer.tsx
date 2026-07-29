"use client";

import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode
} from "react";

import styles from "./context-detail-drawer.module.css";

export type ContextDetailDrawerProps = {
  open: boolean;
  title: string;
  description: string;
  onClose(): void;
  children: ReactNode;
  footer?: ReactNode;
  contentProps?: HTMLAttributes<HTMLDivElement>;
};

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ContextDetailDrawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  contentProps
}: ContextDetailDrawerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const { className: contentClassName, ...restContentProps } =
    contentProps ?? {};

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
    >
      <div className={styles.surface}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>{description}</p>
          </div>
          <button
            className={styles.close}
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={`Tutup ${title.toLocaleLowerCase("id-ID")}`}
          >
            <CloseIcon />
          </button>
        </header>
        <div
          className={[styles.content, contentClassName]
            .filter(Boolean)
            .join(" ")}
          {...restContentProps}
        >
          {children}
        </div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
