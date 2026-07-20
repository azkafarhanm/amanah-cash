import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export type ContentWrapperProps = HTMLAttributes<HTMLDivElement>;

export function ContentWrapper({ className, ...props }: ContentWrapperProps) {
  return <div className={[styles.contentWrapper, className].filter(Boolean).join(" ")} {...props} />;
}
