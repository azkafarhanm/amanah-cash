import type { ReactNode } from "react";
import { Heading } from "./heading";
import styles from "./ui.module.css";

export type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <header className={styles.sectionHeader}>
      <div className={styles.sectionHeaderCopy}>
        <Heading level={1} variant="screen">{title}</Heading>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className={styles.sectionHeaderAction}>{action}</div> : null}
    </header>
  );
}
