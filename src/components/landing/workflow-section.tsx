import { PageContainer, Section } from "@/components/ui";

import { workflowSteps } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function WorkflowSection() {
  return (
    <Section
      className={styles.workflowSection}
      id="cara-kerja"
      spacing="landing"
      surface="subtle"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Alur yang terarah"
            title="Cara kerja Amanah Cash"
            description="Mulai dari siswa yang tepat, catat aktivitas keuangan, lalu tinjau hasil dan jejaknya."
          />
          <ol className={styles.workflowList}>
            {workflowSteps.map((step) => (
              <li className={styles.workflowItem} key={step.title}>
                <div className={styles.workflowCopy}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <a
            className={styles.workflowAction}
            href="#fitur"
          >
            Lihat fitur yang tersedia
          </a>
        </PageContainer>
      </Reveal>
    </Section>
  );
}
