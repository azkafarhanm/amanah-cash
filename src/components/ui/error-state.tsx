import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./card";
import styles from "./ui.module.css";

export type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  href?: string;
  hrefLabel?: string;
};

export function ErrorState({ title, description, action, href, hrefLabel }: ErrorStateProps) {
  return (
    <Card className={styles.errorState} role="alert">
      <span className={styles.errorStateIcon} aria-hidden="true">!</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
      {href && hrefLabel ? <Link className={styles.errorStateLink} href={href}>{hrefLabel}</Link> : null}
    </Card>
  );
}
