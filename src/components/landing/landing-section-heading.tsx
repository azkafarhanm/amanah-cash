import { Heading } from "@/components/ui";

import styles from "./landing-content.module.css";

export function LandingSectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <Heading level={2} variant="landing-section">
        {title}
      </Heading>
      <p>{description}</p>
    </div>
  );
}
