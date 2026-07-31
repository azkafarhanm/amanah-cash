import { Heading } from "@/components/ui";

import styles from "./landing-content.module.css";

export function LandingSectionHeading({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Heading level={2} variant="landing-section">
        {title}
      </Heading>
      <p>{description}</p>
    </div>
  );
}
