import type { ReactNode } from "react";
import { Card } from "./card";
import { StatusBadge } from "./status-badge";
import styles from "./ui.module.css";

export type FeatureDevelopmentStatus = "PLANNED" | "IN_DEVELOPMENT";

export type FeaturePlaceholderProps = {
  title: string;
  description: string;
  status: FeatureDevelopmentStatus;
  icon?: ReactNode;
  action?: ReactNode;
  estimatedAvailability?: string;
  capabilities?: ReadonlyArray<{ title: string; description: string }>;
};

const STATUS_LABEL: Record<FeatureDevelopmentStatus, string> = {
  PLANNED: "Direncanakan",
  IN_DEVELOPMENT: "Dalam pengembangan"
};

export function FeaturePlaceholder({
  title,
  description,
  status,
  icon = "🚧",
  action,
  estimatedAvailability,
  capabilities = []
}: FeaturePlaceholderProps) {
  const titleId = `feature-${title.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Card className={styles.featurePlaceholder} role="status" aria-labelledby={titleId}>
      <div className={styles.featurePlaceholderIntro}>
        <span className={styles.featurePlaceholderIcon} aria-hidden="true">{icon}</span>
        <div className={styles.featurePlaceholderCopy}>
          <StatusBadge tone={status === "IN_DEVELOPMENT" ? "warning" : "neutral"}>
            {STATUS_LABEL[status]}
          </StatusBadge>
          <h2 id={titleId}>{title}</h2>
          <p>{description}</p>
          <p className={styles.featurePlaceholderAssurance}>
            Modul ini belum tersedia pada versi saat ini dan tidak memengaruhi fitur Amanah Cash lainnya.
          </p>
          {estimatedAvailability ? <p><strong>Perkiraan ketersediaan:</strong> {estimatedAvailability}</p> : null}
        </div>
      </div>
      {capabilities.length ? (
        <div className={styles.futureCapabilities} aria-label="Kemampuan yang direncanakan">
          {capabilities.map((capability) => (
            <article key={capability.title}>
              <span aria-hidden="true">○</span>
              <div>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {action ? <div className={styles.featurePlaceholderAction}>{action}</div> : null}
    </Card>
  );
}
