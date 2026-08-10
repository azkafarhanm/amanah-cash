import { PageContainer, Section } from "@/components/ui";

import { FAQItem } from "./faq-item";
import { frequentlyAskedQuestions } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function FAQSection() {
  return (
    <Section
      className={styles.faqSection}
      id="tanya-jawab"
      spacing="landing"
      surface="canvas"
    >
      <Reveal>
        <PageContainer
          className={`${styles.sectionContent} ${styles.faqContent}`}
        >
          <LandingSectionHeading
            title="Pertanyaan yang sering diajukan"
            eyebrow="Sebelum mulai"
            description="Jawaban singkat tentang penggunaan, akses, pencatatan, laporan, dan pemulihan data."
          />
          <ul className={styles.faqList}>
            {frequentlyAskedQuestions.map((item) => (
              <FAQItem key={item.question} {...item} />
            ))}
          </ul>
        </PageContainer>
      </Reveal>
    </Section>
  );
}
