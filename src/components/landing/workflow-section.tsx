import Link from "next/link";

import { PageContainer, Section } from "@/components/ui";

import { workflowSteps } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";

export function WorkflowSection() {
  return (
    <Section id="cara-kerja" spacing="landing" surface="surface">
      <PageContainer className={styles.sectionContent}>
        <LandingSectionHeading
          title="Cara kerja Amanah Cash"
          description="Tiga langkah membantu operator menemukan siswa, mencatat transaksi, lalu memeriksa hasilnya."
        />
        <ol className={`${styles.workflowList} desktop:grid-cols-3`}>
          {workflowSteps.map((step) => (
            <li className={styles.workflowItem} key={step.title}>
              <div className={styles.workflowCopy}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          className={styles.workflowAction}
          href="#pratinjau-aplikasi"
        >
          Lihat tampilan aplikasi
        </Link>
      </PageContainer>
    </Section>
  );
}
