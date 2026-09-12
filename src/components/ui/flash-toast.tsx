"use client";

import { useState } from "react";
import { Toast, type ToastTone } from "./toast";
import styles from "./toast.module.css";

export function FlashToast({
  title,
  description,
  tone = "success"
}: {
  title: string;
  description?: string;
  tone?: ToastTone;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className={styles.toastContainer} aria-label="Notifikasi">
      <Toast
        tone={tone}
        title={title}
        description={description}
        onClose={() => setVisible(false)}
      />
    </div>
  );
}
