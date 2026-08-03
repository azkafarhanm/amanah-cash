"use client";

import React, { useEffect, useState } from "react";
import styles from "./toast.module.css";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id?: string;
  tone?: ToastTone;
  title?: string;
  description?: string;
  duration?: number; // ms, default 5000ms. 0 to disable auto dismiss
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "toast" | "banner";
  className?: string;
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  switch (tone) {
    case "success":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 18A8 8 0 1010 2a8 8 0 000 16zm-1.707-5.293a1 1 0 010-1.414L11.586 8 8.293 4.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" fill="none" />
          <path d="M10 17.5A7.5 7.5 0 1010 2.5a7.5 7.5 0 000 15zm-2.293-7.293a1 1 0 011.414-1.414L10.5 10.086l3.379-3.379a1 1 0 011.414 1.414l-4.086 4.086a1 1 0 01-1.414 0L7.707 10.207z" fill="currentColor" />
        </svg>
      );
    case "error":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 17.5A7.5 7.5 0 1010 2.5a7.5 7.5 0 000 15zm0-10a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 0110 7.5zm0 7a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
        </svg>
      );
    case "warning":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.516 2.63H3.721c-1.347 0-2.189-1.463-1.515-2.63L8.485 2.495zM10 6a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 6zm0 7a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 17.5A7.5 7.5 0 1010 2.5a7.5 7.5 0 000 15zm.75-10a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5zm-.75 2.5a.75.75 0 00-.75.75v3a.75.75 0 001.5 0v-3A.75.75 0 0010 10z" fill="currentColor" />
        </svg>
      );
  }
}

export function Toast({
  tone = "success",
  title,
  description,
  duration = 5000,
  onClose,
  action,
  variant = "toast",
  className,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  function handleDismiss() {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 180);
  }

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const toneClass =
    tone === "success"
      ? styles.toneSuccess
      : tone === "error"
      ? styles.toneError
      : tone === "warning"
      ? styles.toneWarning
      : styles.toneInfo;

  const isBanner = variant === "banner";

  return (
    <div
      className={`${isBanner ? styles.banner : styles.toast} ${toneClass} ${
        isExiting ? styles.toastExiting : ""
      } ${className || ""}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <div className={styles.iconBadge}>
        <ToneIcon tone={tone} />
      </div>

      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        {description && <p className={styles.description}>{description}</p>}
        {action && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              action.onClick();
              handleDismiss();
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="Tutup notifikasi"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3.5 3.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {!isBanner && duration > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}
