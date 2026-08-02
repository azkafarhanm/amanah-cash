import styles from "./ui.module.css";

export type SectionDividerProps = {
  className?: string;
};

export function SectionDivider({ className }: SectionDividerProps) {
  const combinedClassName = className ? `${styles.sectionDivider} ${className}` : styles.sectionDivider;
  return <hr className={combinedClassName} aria-hidden="true" />;
}
