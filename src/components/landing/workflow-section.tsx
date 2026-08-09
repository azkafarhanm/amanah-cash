import Link from "next/link";

import { PageContainer, Section } from "@/components/ui";

import { workflowSteps } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function WorkflowSection() {
  return (
    <Reveal>
    <Section
      className={styles.workflowSection}
      id="cara-kerja"
      spacing="landing"
      surface="surface"
    >
      <PageContainer className={styles.sectionContent}>
        <LandingSectionHeading
          eyebrow="Alur yang terarah"
          title="Cara kerja Amanah Cash"
          description="Mulai dari siswa yang tepat, catat aktivitas keuangan, lalu tinjau hasil dan jejaknya."
        />
        <ol className={`${styles.workflowList} tablet:grid-cols-2 desktop:grid-cols-3`}>
          {workflowSteps.map((step, index) => (
            <li className={styles.workflowItem} key={step.title}>
              <div className={styles.workflowCopy}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < workflowSteps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={styles.workflowConnector}
                />
              )}
            </li>
          ))}
        </ol>
        <Link
          className={styles.workflowAction}
          href="#fitur"
        >
          Lihat fitur yang tersedia
        </Link>
      </PageContainer>
    </Section>
    </Reveal>
  );
}
