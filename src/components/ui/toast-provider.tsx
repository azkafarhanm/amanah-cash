"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { Toast, type ToastTone, type ToastProps } from "./toast";
import styles from "./toast.module.css";

export interface ToastOptions {
  tone?: ToastTone;
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  show: (options: ToastOptions | string) => string;
  success: (message: string, description?: string) => string;
  error: (message: string, description?: string) => string;
  warning: (message: string, description?: string) => string;
  info: (message: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (options: ToastOptions | string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem =
        typeof options === "string"
          ? { id, title: options, tone: "success" }
          : { id, tone: "success", ...options };

      setToasts((prev) => [...prev.slice(-4), newToast]); // limit max 5 active toasts
      return id;
    },
    []
  );

  const success = useCallback(
    (message: string, description?: string) =>
      show({ tone: "success", title: message, description }),
    [show]
  );

  const error = useCallback(
    (message: string, description?: string) =>
      show({ tone: "error", title: message, description }),
    [show]
  );

  const warning = useCallback(
    (message: string, description?: string) =>
      show({ tone: "warning", title: message, description }),
    [show]
  );

  const info = useCallback(
    (message: string, description?: string) =>
      show({ tone: "info", title: message, description }),
    [show]
  );

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info, dismiss }}>
      {children}
      <div className={styles.toastContainer} aria-label="Notifikasi">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            tone={t.tone}
            title={t.title}
            description={t.description}
            duration={t.duration}
            action={t.action}
            onClose={() => dismiss(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside Provider, return dummy/console function or standalone handler
    return {
      show: (opts) => {
        console.warn("useToast called outside ToastProvider:", opts);
        return "";
      },
      success: (msg) => {
        console.warn("useToast.success called outside ToastProvider:", msg);
        return "";
      },
      error: (msg) => {
        console.warn("useToast.error called outside ToastProvider:", msg);
        return "";
      },
      warning: (msg) => {
        console.warn("useToast.warning called outside ToastProvider:", msg);
        return "";
      },
      info: (msg) => {
        console.warn("useToast.info called outside ToastProvider:", msg);
        return "";
      },
      dismiss: () => {},
    };
  }
  return context;
}
