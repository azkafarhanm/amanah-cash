import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./card";
import styles from "./ui.module.css";

export type ErrorStateProps = {
  title: string;
  description: string;
  kind?: "system" | "forbidden" | "notFound" | "unauthorized";
  action?: ReactNode;
  href?: string;
  hrefLabel?: string;
};

const ICON = { system: "!", forbidden: "×", notFound: "?", unauthorized: "→" } as const;

export function ErrorState({ title, description, kind = "system", action, href, hrefLabel }: ErrorStateProps) {
  return (
    <Card className={styles.errorState} role="alert">
      <span className={[styles.errorStateIcon, styles[`errorStateIcon${kind[0].toUpperCase()}${kind.slice(1)}`]].join(" ")} aria-hidden="true">{ICON[kind]}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
      {href && hrefLabel ? <Link className={styles.errorStateLink} href={href}>{hrefLabel}</Link> : null}
    </Card>
  );
}
