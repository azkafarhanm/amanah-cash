import { PageContainer, Section } from "@/components/ui";

import { workflowSteps } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

const workflowPanelA = workflowSteps.slice(0, 4);
const workflowPanelB = workflowSteps.slice(4, 6);

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
          {/* Desktop & Tablet: Unified 6-step layout */}
          <div className={styles.workflowDesktopOnly}>
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
          </div>
          {/* Mobile/PWA: Panel A (Steps 1–4) */}
          <div className={styles.workflowMobileOnly}>
            <ol className={styles.workflowList}>
              {workflowPanelA.map((step) => (
                <li className={styles.workflowItem} key={step.title}>
                  <div className={styles.workflowCopy}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </PageContainer>
      </Reveal>
    </Section>
  );
}

export function WorkflowContinuationSection() {
  return (
    <Section
      className={styles.workflowContinuationSection}
      spacing="landing"
      surface="subtle"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Tata kelola & keberlanjutan"
            title="Penelusuran audit dan perlindungan data"
            description="Pastikan setiap perubahan penting terekam jelas dan data operasional terlindungi secara berkala."
          />
          <ol
            className={[styles.workflowList, styles.workflowContinuationList]
              .filter(Boolean)
              .join(" ")}
            start={5}
          >
            {workflowPanelB.map((step) => (
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

